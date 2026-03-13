## 2024-05-30 - Prevent Leaking Stack Traces from API Routes
**Vulnerability:** The `/api/diagnostic` route caught a global error and exposed `error.stack` in its JSON response to clients.
**Learning:** Returning stack traces can expose internals of the project framework, infrastructure, and server environment to users, aiding attackers.
**Prevention:** Never expose `error.stack` or raw errors to clients in Next.js API routes or global error handlers; log them on the server side if necessary, but only return generic error messages to the client.
