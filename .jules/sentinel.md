## 2024-11-20 - [Stack Trace Leakage in API Endpoints]
**Vulnerability:** The `/api/diagnostic` endpoint was exposing raw `error.stack` and internal error messages in its 500 JSON response, potentially leaking sensitive system internals and database errors.
**Learning:** Returning unhandled exception messages directly from catch blocks is a common anti-pattern that can expose internal paths and stack context to clients. Error objects in catch blocks often contain environment-specific details.
**Prevention:** Catch blocks in public API endpoints should log the original error using `console.error` and return a generic, static error string to the client. Never return `error.stack` or raw `error.message` directly in HTTP responses unless intended and sanitized.
