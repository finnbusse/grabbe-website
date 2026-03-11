/**
 * Client-side image processing pipeline for the CMS media library.
 *
 * Every image uploaded via the Image-Picker (file upload **and** URL import)
 * passes through {@link processImageForUpload} before it reaches the CDN.
 *
 * Processing steps:
 * 1. **Format conversion** – raster images are converted to WebP (SVGs are
 *    returned unchanged).
 * 2. **Metadata stripping** – drawing the image onto an off-screen canvas
 *    inherently removes all EXIF / GPS / camera metadata.
 * 3. **Compression** – the WebP quality is iteratively reduced until the
 *    output is below {@link TARGET_MAX_BYTES} (700 KB). The initial quality
 *    is already adjusted based on the source file size so that most images
 *    are compressed in a single pass.
 * 4. **Copyright injection** – a lightweight XMP packet containing
 *    `© Finn Busse` is embedded in the WebP RIFF container.
 * 5. **Random filename** – the original filename is replaced by a
 *    `crypto.randomUUID()`-based name with a `.webp` extension.
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Hard upper limit – every output must be below this. */
const ABSOLUTE_MAX_BYTES = 1_000_000 // 1 MB

/** Soft target – we aim for this or smaller. */
const TARGET_MAX_BYTES = 700_000 // 700 KB

/** Maximum pixel dimension (width or height) for the output image. */
const MAX_DIMENSION = 2048

/** Minimum WebP quality we allow during iterative compression. */
const MIN_QUALITY = 0.3

/** Quality step for iterative compression. */
const QUALITY_STEP = 0.08

// ---------------------------------------------------------------------------
// SVG detection helper
// ---------------------------------------------------------------------------

function isSvg(file: File): boolean {
  if (file.type === "image/svg+xml") return true
  return file.name.toLowerCase().endsWith(".svg")
}

// ---------------------------------------------------------------------------
// XMP copyright packet
// ---------------------------------------------------------------------------

const XMP_COPYRIGHT = [
  '<?xpacket begin="\uFEFF" id="W5M0MpCehiHzreSzNTczkc9d"?>',
  '<x:xmpmeta xmlns:x="adobe:ns:meta/">',
  '  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">',
  '    <rdf:Description rdf:about=""',
  '      xmlns:dc="http://purl.org/dc/elements/1.1/"',
  '      xmlns:xmpRights="http://ns.adobe.com/xap/1.0/rights/">',
  "      <dc:rights>",
  "        <rdf:Alt>",
  '          <rdf:li xml:lang="x-default">\u00A9 Finn Busse</rdf:li>',
  "        </rdf:Alt>",
  "      </dc:rights>",
  "      <xmpRights:Marked>True</xmpRights:Marked>",
  "    </rdf:Description>",
  "  </rdf:RDF>",
  "</x:xmpmeta>",
  '<?xpacket end="w"?>',
].join("\n")

/**
 * Inject an XMP copyright chunk into a WebP blob.
 *
 * WebP uses the RIFF container format:
 * ```
 * RIFF <fileSize:u32-LE> WEBP <chunks…>
 * ```
 * We append an `XMP ` chunk (FourCC `XMP `) containing the copyright XML.
 */
function injectXmpCopyright(webpBytes: ArrayBuffer): ArrayBuffer {
  const encoder = new TextEncoder()
  const xmpPayload = encoder.encode(XMP_COPYRIGHT)

  // XMP chunk: FourCC "XMP " (4 bytes) + size (4 bytes LE) + payload
  // RIFF chunks with odd-length payload need a padding byte.
  const needsPadding = xmpPayload.byteLength % 2 !== 0
  const chunkSize = 4 + 4 + xmpPayload.byteLength + (needsPadding ? 1 : 0)

  const output = new ArrayBuffer(webpBytes.byteLength + chunkSize)
  const outView = new DataView(output)
  const srcView = new DataView(webpBytes)
  const outBytes = new Uint8Array(output)
  const srcBytes = new Uint8Array(webpBytes)

  // Copy original data
  outBytes.set(srcBytes)

  // Update RIFF file size (offset 4, little-endian uint32)
  const originalRiffSize = srcView.getUint32(4, true)
  outView.setUint32(4, originalRiffSize + chunkSize, true)

  // Write XMP chunk at the end
  const offset = webpBytes.byteLength
  // FourCC "XMP "
  outBytes[offset] = 0x58 // X
  outBytes[offset + 1] = 0x4d // M
  outBytes[offset + 2] = 0x50 // P
  outBytes[offset + 3] = 0x20 // <space>
  // Chunk data size (little-endian)
  outView.setUint32(offset + 4, xmpPayload.byteLength, true)
  // Payload
  outBytes.set(xmpPayload, offset + 8)
  // Padding byte (if needed) is already 0x00 from ArrayBuffer init

  return output
}

// ---------------------------------------------------------------------------
// Canvas-based image processing
// ---------------------------------------------------------------------------

/**
 * Load a File/Blob into an HTMLImageElement via an object URL.
 */
function loadImage(source: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(source)
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error("Bild konnte nicht geladen werden"))
    }
    img.src = url
  })
}

/**
 * Compute the initial quality estimate based on the raw file size.
 * Larger sources need a more aggressive starting quality.
 */
function estimateInitialQuality(rawBytes: number): number {
  if (rawBytes <= TARGET_MAX_BYTES) return 0.82
  if (rawBytes <= 2_000_000) return 0.72
  if (rawBytes <= 5_000_000) return 0.60
  if (rawBytes <= 10_000_000) return 0.50
  return 0.42
}

/**
 * Draw an image onto a canvas, capping the dimensions at {@link MAX_DIMENSION}.
 * Returns the canvas and its 2D context.
 */
function drawToCanvas(
  img: HTMLImageElement,
): { canvas: OffscreenCanvas; ctx: OffscreenCanvasRenderingContext2D } {
  let { naturalWidth: w, naturalHeight: h } = img

  // Down-scale if either dimension exceeds the limit
  if (w > MAX_DIMENSION || h > MAX_DIMENSION) {
    const scale = MAX_DIMENSION / Math.max(w, h)
    w = Math.round(w * scale)
    h = Math.round(h * scale)
  }

  const canvas = new OffscreenCanvas(w, h)
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Canvas 2D Kontext nicht verfügbar")

  ctx.drawImage(img, 0, 0, w, h)
  return { canvas, ctx }
}

/**
 * Convert the canvas content to a WebP blob, iteratively lowering quality
 * until the output is within the size budget.
 */
async function canvasToWebP(canvas: OffscreenCanvas, initialQuality: number): Promise<Blob> {
  let quality = initialQuality

  // First attempt
  let blob = await canvas.convertToBlob({ type: "image/webp", quality })

  // Iteratively reduce quality if still over budget
  while (blob.size > TARGET_MAX_BYTES && quality > MIN_QUALITY) {
    quality = Math.max(quality - QUALITY_STEP, MIN_QUALITY)
    blob = await canvas.convertToBlob({ type: "image/webp", quality })
  }

  // If still over the absolute limit, make a final aggressive attempt
  if (blob.size > ABSOLUTE_MAX_BYTES) {
    blob = await canvas.convertToBlob({ type: "image/webp", quality: MIN_QUALITY })
  }

  return blob
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export interface ProcessedImage {
  /** The processed WebP blob (or original SVG blob). */
  blob: Blob
  /** A random filename with the appropriate extension. */
  filename: string
  /** MIME type of the output. */
  mimeType: string
}

/**
 * Process an image file for CDN upload.
 *
 * - SVG files are returned **unchanged** (no conversion or compression).
 * - All other raster images are converted to WebP, compressed, stripped of
 *   metadata, and have copyright information injected.
 * - The filename is replaced by a random UUID-based name.
 *
 * @param file – The raw image file from the user's device or a fetched blob.
 * @returns Processed image ready for upload.
 */
export async function processImageForUpload(file: File): Promise<ProcessedImage> {
  // SVGs pass through unchanged (only randomise the filename)
  if (isSvg(file)) {
    return {
      blob: file,
      filename: `${crypto.randomUUID()}.svg`,
      mimeType: "image/svg+xml",
    }
  }

  // 1. Load into an <img> element (strips metadata implicitly)
  const img = await loadImage(file)

  // 2. Draw onto an off-screen canvas (down-scaling if needed)
  const { canvas } = drawToCanvas(img)

  // 3. Export to WebP with adaptive quality
  const quality = estimateInitialQuality(file.size)
  const webpBlob = await canvasToWebP(canvas, quality)

  // 4. Inject XMP copyright
  const rawBuffer = await webpBlob.arrayBuffer()
  const withCopyright = injectXmpCopyright(rawBuffer)

  // 5. Build final Blob + random filename
  const finalBlob = new Blob([withCopyright], { type: "image/webp" })
  const filename = `${crypto.randomUUID()}.webp`

  return { blob: finalBlob, filename, mimeType: "image/webp" }
}

/**
 * Fetch an image from an external URL and return it as a File object
 * suitable for {@link processImageForUpload}.
 *
 * The fetch is proxied through the browser so CORS restrictions apply.
 * If the fetch fails, the function throws with a human-readable German
 * error message.
 */
export async function fetchImageAsFile(url: string): Promise<File> {
  let response: Response
  try {
    response = await fetch(url)
  } catch {
    throw new Error("Das Bild konnte nicht von der angegebenen URL geladen werden.")
  }

  if (!response.ok) {
    throw new Error(`Bild-Download fehlgeschlagen (HTTP ${response.status}).`)
  }

  const contentType = response.headers.get("content-type") || "image/jpeg"
  const blob = await response.blob()

  // Derive a reasonable extension from the content type
  const ext = contentType.includes("svg") ? "svg"
    : contentType.includes("png") ? "png"
    : contentType.includes("gif") ? "gif"
    : contentType.includes("webp") ? "webp"
    : "jpg"

  return new File([blob], `import.${ext}`, { type: contentType })
}
