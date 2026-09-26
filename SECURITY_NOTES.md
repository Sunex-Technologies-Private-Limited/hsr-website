# HSR Digital Hub Security Notes (Remaining Risks)

1. **Email Delivery Reliability**: Resend webhooks are not fully integrated for bounce management. An idempotent outbox pattern should be added to guarantee delivery.
2. **S3 Bucket Public Access**: Presigned URLs are secure, but the S3 bucket itself must remain tightly configured to block public object reads to prevent direct access bypass.
3. **Admin Credential Rotation**: Admin sessions lack a strict forced-invalidation mechanism if a token is compromised. Token lifetimes are the primary defense.
4. **Rate Limit Memory Store**: Rate limiters use in-memory stores. If running in a multi-instance (cluster) deployment, they will not accurately track global IP counts. Redis is recommended for distributed limiting.
5. **PDF Watermarking**: Currently, digital assets are served exactly as uploaded. Adding dynamic watermarking (e.g. stamping buyer email on PDFs) is a recommended anti-piracy step.
