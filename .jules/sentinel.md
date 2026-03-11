## 2024-05-18 - [API Route Error Handler Exposes Internal Stack Trace]
**Vulnerability:** The global error handler in `app/api/diagnostic/route.ts` was catching generic exceptions and exposing `error.stack` to the client response, which leaked internal stack traces and server internals.
**Learning:** Returning `error.stack` in API responses directly to clients is a security risk as it can provide attackers with insights into the system's architecture and potential vulnerabilities.
**Prevention:** Ensure API routes and global error handlers do not leak internal system details by returning `error.stack` in responses. Only return safe, generic error messages to the client.
