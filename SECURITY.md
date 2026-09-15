# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.0.x   | :white_check_mark: |
| 1.0.x   | :x:                |

---

## Reporting a Vulnerability

The TripNest team takes security seriously. If you discover a security vulnerability within the TripNest 2.0 application or API, please report it responsibly.

### How to Report

1. **Do not open a public issue** on GitHub for security vulnerabilities.
2. Please send a detailed email to the maintainers or use GitHub's private vulnerability reporting feature.
3. Include the following details in your report:
   - Description of the vulnerability and its potential impact.
   - Step-by-step reproduction instructions or a minimal proof of concept (PoC).
   - Any suggested mitigations or patches.

### Response Timeline

- **Acknowledgment**: Within 48 hours.
- **Vulnerability Assessment**: Within 5 business days.
- **Fix & Advisory Release**: Coordinated with the reporter after testing.

---

## Security Best Practices in TripNest

- **Authentication**: JWT tokens issued and verified through Supabase Auth.
- **Environment Variables**: Sensitive credentials (database keys, JWT secrets) are kept in `.env` files and never committed to version control.
- **Input Sanitization**: Backend requests are validated using Spring Validation annotations.
- **CORS Protection**: Origin-restricted CORS policies for web clients.
