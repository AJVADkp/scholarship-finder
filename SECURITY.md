# Security Policy

## Supported Versions

Only the latest active major version receives security updates and vulnerability patches.

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We prioritize the security and confidentiality of user data, API keys, and platform credentials.

If you believe you have discovered a security vulnerability in ScholarSearch:

1. **Do not create a public GitHub issue.**
2. Send an email to the project maintainers with the details of the vulnerability.
3. Include clear reproduction steps, potential impact, and any proof-of-concept scripts or requests.
4. We acknowledge reports within 48 business hours and provide a remediation timeline.

### Scope

- Authentication mechanisms (Supabase Auth, Admin JWT sessions)
- Sensitive credential protection (`SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_JWT_SECRET`)
- Route handler authorization, rate limiting, and input validation
- Cross-Site Scripting (XSS), SQL injection, and Server-Side Request Forgery (SSRF)
