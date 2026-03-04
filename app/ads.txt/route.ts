export const revalidate = 86400

export async function GET() {
  // Return an empty response or basic placeholder for ads.txt to resolve 404s
  return new Response("", {
    headers: { "Content-Type": "text/plain" },
  })
}
