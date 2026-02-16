# Specification: Digital Signature Integration

## Goal
Enable field workers to collect digital signatures from customers upon job completion, ensuring legal accountability and verifiable proof of service.

## Scope
1.  **Mobile Capture:** Add a signature pad component to the "Complete Job" flow in the mobile app.
2.  **Storage:** Securely store signature data (as images) in Cloudinary or similar storage.
3.  **Reporting:** Display collected signatures in the Web Admin dashboard and include them in generated PDF reports.

## Requirements
- Signature must be mandatory for job completion (configurable).
- Signatures should be associated with a timestamp and GPS coordinates.
- Storage should ensure integrity (signatures cannot be altered once saved).
