# Firestore on Spark

The failed deployment requested managed TTL through `ttl: true` on `cmsRateLimits.expiresAt`. TTL deletion requires billing. That flag is removed; an ordinary ascending timestamp index supports bounded expiry queries. The four catalog composite indexes retain their exact fields, scope and ordering. No catalog document migration is required.

## Rate limits and cleanup

- Every admin and enquiry counter checks server time and its expiration inside a Firestore transaction. An expired retained document counts as zero. Quotas, identities and fixed windows remain enforced atomically; rejected requests do not increment the counter. Invalid active counters fail closed.
- After a rate-limit request, Next.js `after()` runs maintenance within the request lifetime. An in-process cooldown avoids unnecessary lease transactions. A Firestore transaction on `appMaintenance/rate-limit-cleanup-v1` admits one worker every five minutes across instances; its lease expires after two minutes if the worker stops.
- Each run queries at most 25 expired records from each of `cmsRateLimits` and `enquiryRateLimits`, ordered by `expiresAt`. There are no full scans. BulkWriter deletes at most 50 candidates, throttled to 20 operations per second, with bounded transient retries.
- Every deletion requires the snapshot's update time. A concurrent quota refresh invalidates that precondition and is preserved. Only the two top-level limiter collections in the same database instance are accepted. Active records are skipped. Errors are logged without document IDs, credentials or request data; maintenance failure never makes the quota permissive.
- Catalog and CMS cache keys retain project and emulator-host isolation. Maintenance is server-only, with no public cleanup endpoint and no direct-client Firestore permissions.

No traffic means no automatic cleanup. Logical expiration still works; bounded physical cleanup resumes with requests or an operator command. This is not an idle-time deletion guarantee. Sustained abuse can exhaust Spark quotas; the application cannot provide unlimited capacity on a free plan. Keep usage below the project's free read/write/delete limits.

## Operator maintenance

Use Node 22.13+ from the project directory. The default is read-only, with at most 25 candidates per collection:

```sh
node --conditions=react-server --experimental-strip-types --env-file=.env.local scripts/cleanup-rate-limits.mjs --project=zeebaran085
```

Add `--apply` to perform one bounded pass, optionally `--max-batches=5` for up to five passes. An active lease is always respected, including manual runs. The script checks that the explicit project matches the environment. Emulator use requires a separate `demo-` project and a loopback host; live project credentials must never be redirected to an emulator. Do not use this script to migrate catalog data.

Deploy only the declared indexes:

```sh
firebase deploy --only firestore:indexes --project zeebaran085
```

Managed TTL is explicitly rejected by the older optional REST deployment script as well. Do not add `ttl: true`, enable billing, attach a billing account, or enable scheduled Functions, Scheduler, PITR, backups, restore or cloning as part of Spark setup. [Firestore pricing](https://firebase.google.com/docs/firestore/pricing) documents the billing-dependent operations.

## Other existing dependencies

The optional enquiry PDF path uses Firebase/Google Cloud Storage and an external scanner; Firebase Storage now requires Blaze. It remains unavailable on a Spark-only setup and was not activated or replaced by this change. Catalog images continue using their existing Cloudinary references. Cloudinary has its own independent plan limits. [Firebase Storage requirements](https://firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024).

Authentication, authorization, deny-all direct-client Firestore rules and authorized domains are unchanged. Secrets remain in server-only environment variables. No rules, authentication configuration, billing settings or product data are deployed by the index-only command.

## Verification

`npm test` covers counter expiration and malformed-state behavior. `scripts/check-spark-rate-limits.mjs` uses only an explicit isolated demo emulator project to check atomic quotas, window rollover, conditional deletion, cross-project rejection, bounded batches and competing cleanup workers. It never loads `.env.local` or writes production fixtures. Production connectivity and catalog query/index compatibility must be checked separately with read-only calls after deployment; emulator success does not prove production index readiness.
