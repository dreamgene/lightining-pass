# GitHub Issue Backlog

This file contains 200 issue drafts for the Rust/Stellar HASKE migration.
Each issue is written so it can be copied directly into GitHub or bulk-loaded
later with automation once repository authentication is fixed.

## 1. Replace ephemeral signing key with persisted key loading
Labels: `rust`, `security`, `backend`
Acceptance: `api_server` loads a stable Ed25519 signing key from config or file and refuses production startup without one.

## 2. Export verifier public key from signing key tooling
Labels: `rust`, `security`, `cli`
Acceptance: a documented command or helper derives the public key used by `verifier_cli`.

## 3. Add startup validation for malformed `HASKE_SIGNING_KEY_BASE64`
Labels: `rust`, `backend`
Acceptance: startup fails with a clear message when the configured key cannot decode to 32 bytes.

## 4. Embed a real public key option in verifier builds
Labels: `rust`, `cli`, `security`
Acceptance: verifier can be built with a release-time embedded public key instead of a placeholder constant.

## 5. Add `--token-file` support to verifier CLI
Labels: `rust`, `cli`
Acceptance: verifier reads signed token JSON from disk via `--token-file`.

## 6. Add machine-readable verifier output mode
Labels: `rust`, `cli`
Acceptance: verifier supports `--json` and prints structured validation results.

## 7. Surface detailed verifier failure reasons
Labels: `rust`, `cli`, `ux`
Acceptance: invalid tokens distinguish signature failure, expiry failure, and parse failure.

## 8. Support configurable expiry grace window in verifier
Labels: `rust`, `cli`, `security`
Acceptance: verifier allows an optional small tolerance for clock drift.

## 9. Add verifier tests for Stellar token payloads
Labels: `rust`, `testing`, `cli`
Acceptance: unit or integration tests cover Stellar-shaped signed tokens end to end.

## 10. Add verifier tests for legacy Lightning compatibility
Labels: `rust`, `testing`, `cli`
Acceptance: older token shapes continue to verify or fail in a documented way.

## 11. Document stable signing key generation workflow
Labels: `docs`, `security`, `rust`
Acceptance: README or dedicated doc shows how to generate and store Ed25519 keys safely.

## 12. Add a key generation utility crate or subcommand
Labels: `rust`, `cli`, `security`
Acceptance: project provides a supported way to create signing keys without external tooling.

## 13. Add startup warning when running with ephemeral signing key
Labels: `rust`, `backend`
Acceptance: demo-mode warning clearly explains that restart invalidates existing passes.

## 14. Introduce environment profiles for demo vs production
Labels: `rust`, `backend`, `ops`
Acceptance: config handling separates safe demo defaults from stricter production defaults.

## 15. Reject empty `STELLAR_DESTINATION_ADDRESS`
Labels: `rust`, `backend`
Acceptance: startup validates destination account format and errors early.

## 16. Validate Stellar account format before boot
Labels: `rust`, `backend`, `stellar`
Acceptance: invalid Stellar destination strings are rejected before the watcher starts.

## 17. Add `Config` struct instead of ad hoc env parsing
Labels: `rust`, `refactor`, `backend`
Acceptance: one central config type owns env parsing and validation.

## 18. Add config unit tests
Labels: `rust`, `testing`, `backend`
Acceptance: tests cover missing env vars, malformed values, and default values.

## 19. Add rate limiting middleware to API server
Labels: `rust`, `backend`, `security`
Acceptance: repeated session creation can be throttled per client.

## 20. Add request tracing middleware
Labels: `rust`, `backend`, `observability`
Acceptance: each request gets request-id and structured logs.

## 21. Replace `println!`/`eprintln!` logging with `tracing`
Labels: `rust`, `observability`, `refactor`
Acceptance: server uses structured logging across routes and background tasks.

## 22. Add health check endpoint
Labels: `rust`, `backend`, `ops`
Acceptance: `GET /healthz` returns server readiness without querying Horizon.

## 23. Add readiness check endpoint with Horizon dependency status
Labels: `rust`, `backend`, `ops`
Acceptance: `GET /readyz` reports whether Horizon is reachable.

## 24. Add metrics endpoint
Labels: `rust`, `backend`, `observability`
Acceptance: counters for sessions created, payments matched, tokens issued, and verifier failures are exposed.

## 25. Persist payment sessions beyond process restart
Labels: `rust`, `backend`, `storage`
Acceptance: session records survive API restarts using SQLite or another lightweight store.

## 26. Persist issued tokens for auditability
Labels: `rust`, `backend`, `storage`
Acceptance: signed token metadata can be queried after issuance.

## 27. Persist payment detection checkpoints
Labels: `rust`, `backend`, `stellar`
Acceptance: watcher resumes without reprocessing the entire account history.

## 28. Add repository `.gitignore` rules for runtime data
Labels: `repo`, `security`, `ops`
Acceptance: keys, local DBs, QR artifacts, and logs are excluded from git.

## 29. Remove committed secret-like runtime artifacts from the repo
Labels: `repo`, `security`
Acceptance: tracked seeds and transient runtime files are removed and ignored going forward.

## 30. Decide fate of legacy `lightning_node` crate
Labels: `architecture`, `repo`, `rust`
Acceptance: crate is either archived, feature-gated, or removed cleanly.

## 31. Remove unused vendored `ldk-node` tree or document why it remains
Labels: `repo`, `cleanup`
Acceptance: vendored dependencies are either justified or deleted.

## 32. Add workspace-level feature flags for payment providers
Labels: `rust`, `architecture`
Acceptance: Lightning and Stellar can be compiled conditionally through Cargo features.

## 33. Add a provider registry abstraction
Labels: `rust`, `architecture`
Acceptance: API server can select providers by configuration rather than direct construction.

## 34. Add chain-agnostic payment request domain model
Labels: `rust`, `architecture`, `refactor`
Acceptance: payment request structs no longer assume Stellar-only payload shape where avoidable.

## 35. Rename `PaymentEvent` fields for stronger provider neutrality
Labels: `rust`, `architecture`, `refactor`
Acceptance: common event naming can support Stellar, Lightning, and future chains consistently.

## 36. Add trait docs for `PaymentProvider`
Labels: `rust`, `docs`
Acceptance: trait methods specify matching guarantees and expected provider semantics.

## 37. Add mock payment provider for local tests
Labels: `rust`, `testing`
Acceptance: API server tests can run without live Horizon calls.

## 38. Add in-memory fake Horizon client
Labels: `rust`, `testing`, `stellar`
Acceptance: Stellar adapter behavior can be tested with deterministic sample responses.

## 39. Add parser tests for native XLM payment records
Labels: `rust`, `testing`, `stellar`
Acceptance: parser maps native payment records into internal events correctly.

## 40. Add parser tests for issued asset payment records
Labels: `rust`, `testing`, `stellar`
Acceptance: parser preserves asset code for credit asset payments.

## 41. Handle non-payment records explicitly
Labels: `rust`, `stellar`, `backend`
Acceptance: non-payment operations are skipped and logged at debug level.

## 42. Handle missing memo records gracefully
Labels: `rust`, `stellar`
Acceptance: records without memos never match a session and do not panic.

## 43. Handle muxed account destinations if needed
Labels: `rust`, `stellar`
Acceptance: adapter documents or supports muxed destination addresses.

## 44. Support transaction-level memo lookup when payment record lacks memo
Labels: `rust`, `stellar`
Acceptance: matching can fall back to transaction data where necessary.

## 45. Add Horizon pagination handling
Labels: `rust`, `stellar`, `backend`
Acceptance: account payment scans continue across multiple pages when recent history is large.

## 46. Add cursor-based polling instead of repeated descending scans
Labels: `rust`, `stellar`, `performance`
Acceptance: watcher keeps a checkpoint and queries only new payments.

## 47. Add polling backoff on Horizon errors
Labels: `rust`, `stellar`, `resilience`
Acceptance: transient failures do not hammer Horizon.

## 48. Add retry budget for Horizon requests
Labels: `rust`, `stellar`, `resilience`
Acceptance: network errors retry with capped attempts and structured logs.

## 49. Add timeout configuration for Horizon HTTP calls
Labels: `rust`, `stellar`, `ops`
Acceptance: client timeouts are configurable and sane by default.

## 50. Add custom user-agent for Horizon requests
Labels: `rust`, `stellar`, `ops`
Acceptance: Horizon traffic identifies HASKE version and environment.

## 51. Validate amount comparisons with decimal precision rules
Labels: `rust`, `stellar`, `bug`
Acceptance: payment matching is not broken by string formatting differences like `10` vs `10.0000000`.

## 52. Normalize Stellar asset comparisons
Labels: `rust`, `stellar`
Acceptance: adapter handles case and canonical asset naming consistently.

## 53. Support issuer-aware asset matching for non-native assets
Labels: `rust`, `stellar`, `feature`
Acceptance: matching uses asset code plus issuer, not code alone.

## 54. Extend payment request model with asset issuer
Labels: `rust`, `stellar`, `architecture`
Acceptance: request and event structs can represent issued assets fully.

## 55. Add USDC-on-Stellar example configuration
Labels: `docs`, `stellar`
Acceptance: docs show how to configure a non-native asset flow.

## 56. Add testnet funding doc for Stellar wallets
Labels: `docs`, `stellar`
Acceptance: README links or explains how to fund testnet accounts for demos.

## 57. Add wallet compatibility matrix
Labels: `docs`, `ux`, `stellar`
Acceptance: docs list wallets tested with `web+stellar:pay`.

## 58. Verify generated `web+stellar:pay` URI against SEP expectations
Labels: `rust`, `stellar`, `standards`
Acceptance: QR payload follows a documented Stellar wallet request format.

## 59. Add memo format strategy docs
Labels: `docs`, `stellar`
Acceptance: docs explain memo uniqueness, length, and collision expectations.

## 60. Replace random memo with URL-safe session id generator
Labels: `rust`, `stellar`, `backend`
Acceptance: memos and session ids use a documented, collision-resistant scheme.

## 61. Separate session id from public memo
Labels: `rust`, `backend`, `architecture`
Acceptance: internal session ids no longer depend on public memo values.

## 62. Add session creation timestamp to shared types
Labels: `rust`, `backend`
Acceptance: session payloads include creation time for debugging and expiry reasoning.

## 63. Return payment request expiry in status response
Labels: `rust`, `backend`, `api`
Acceptance: clients can distinguish request expiry from access token expiry.

## 64. Distinguish request expiry and access token expiry in naming
Labels: `rust`, `backend`, `api`
Acceptance: API fields avoid ambiguity around `expires_at`.

## 65. Add session status enum instead of boolean `paid`
Labels: `rust`, `refactor`, `api`
Acceptance: states like `pending`, `paid`, `expired`, and `failed` are represented explicitly.

## 66. Mark expired unpaid sessions automatically
Labels: `rust`, `backend`
Acceptance: old sessions transition to `expired` instead of remaining ambiguous.

## 67. Add cleanup task for stale sessions
Labels: `rust`, `backend`, `performance`
Acceptance: in-memory or persisted stores do not grow without bound.

## 68. Prevent duplicate token issuance for the same session
Labels: `rust`, `backend`, `bug`
Acceptance: watcher is idempotent if it sees the same payment twice.

## 69. Prevent duplicate token issuance for reused payment data
Labels: `rust`, `security`, `backend`
Acceptance: same transaction cannot accidentally satisfy multiple active sessions.

## 70. Add stronger payment-to-session matching diagnostics
Labels: `rust`, `observability`, `stellar`
Acceptance: logs explain which field blocked a match.

## 71. Expose session detail endpoint for demo debugging
Labels: `rust`, `backend`, `api`
Acceptance: debug mode includes a route showing internal match state safely.

## 72. Add API version prefix
Labels: `rust`, `api`, `architecture`
Acceptance: routes move under `/api/v1/...`.

## 73. Add OpenAPI generation for Axum routes
Labels: `rust`, `api`, `docs`
Acceptance: project can render or export current API schema.

## 74. Add route tests for payment-request endpoint
Labels: `rust`, `testing`, `api`
Acceptance: request validation and response shape are covered.

## 75. Add route tests for payment-status endpoint
Labels: `rust`, `testing`, `api`
Acceptance: pending and paid responses are tested.

## 76. Add route tests for access-token endpoint
Labels: `rust`, `testing`, `api`
Acceptance: token retrieval returns expected payload after issuance.

## 77. Reject malformed JSON bodies with consistent error responses
Labels: `rust`, `api`, `ux`
Acceptance: API returns structured `400` responses for invalid request bodies.

## 78. Add typed API error model
Labels: `rust`, `api`, `refactor`
Acceptance: handlers use shared error responses instead of raw status codes only.

## 79. Return structured error bodies from all handlers
Labels: `rust`, `api`, `ux`
Acceptance: clients receive machine-readable error objects with messages and codes.

## 80. Validate amount input at request creation
Labels: `rust`, `api`, `security`
Acceptance: invalid or zero amounts are rejected.

## 81. Validate supported asset input at request creation
Labels: `rust`, `api`, `stellar`
Acceptance: unsupported assets return validation errors.

## 82. Add optional event metadata to session creation
Labels: `rust`, `api`, `feature`
Acceptance: session request may include venue or ticket context.

## 83. Include event metadata in signed token
Labels: `rust`, `security`, `feature`
Acceptance: token can bind access to specific venue/session context.

## 84. Include destination account in signed token
Labels: `rust`, `security`
Acceptance: token payload can prove which receiver account was paid.

## 85. Include confirmed-at timestamp in signed token
Labels: `rust`, `feature`
Acceptance: tokens may optionally carry payment confirmation time.

## 86. Add token schema version migration docs
Labels: `docs`, `rust`
Acceptance: token evolution rules are documented for backward compatibility.

## 87. Add compact token format for Stellar payloads
Labels: `rust`, `feature`, `performance`
Acceptance: project offers a smaller QR-friendly encoding option for Stellar tokens.

## 88. Benchmark JSON token size vs compact format
Labels: `rust`, `performance`, `testing`
Acceptance: doc or benchmark compares resulting QR density and scan reliability.

## 89. Add QR size configurability
Labels: `rust`, `feature`, `qr`
Acceptance: API can choose image size for invoice and access QR generation.

## 90. Add SVG QR output support
Labels: `rust`, `feature`, `qr`
Acceptance: QR crate can produce SVG for web rendering.

## 91. Add QR error-correction level control
Labels: `rust`, `feature`, `qr`
Acceptance: code can tune QR resilience for dense signed payloads.

## 92. Add snapshot tests for QR output
Labels: `rust`, `testing`, `qr`
Acceptance: deterministic QR generation is validated in tests.

## 93. Add optional raw token in API response toggle
Labels: `rust`, `api`, `security`
Acceptance: API can omit raw signed token when only QR is desired.

## 94. Serve static checkout assets from Axum
Labels: `rust`, `frontend`, `api`
Acceptance: server can host the buyer-facing web pages directly.

## 95. Update checkout page to call Stellar endpoints
Labels: `frontend`, `ux`, `stellar`
Acceptance: current web demo works with `/api/payment-request` and status polling.

## 96. Replace Lightning-specific copy in frontend
Labels: `frontend`, `copy`, `stellar`
Acceptance: UI language reflects Stellar payments and memos.

## 97. Render payment request QR from API response in frontend
Labels: `frontend`, `ux`
Acceptance: checkout shows the Stellar wallet QR payload clearly.

## 98. Add pending confirmation state to frontend
Labels: `frontend`, `ux`
Acceptance: buyer sees payment-waiting state while watcher polls.

## 99. Add confirmed access state to frontend
Labels: `frontend`, `ux`
Acceptance: frontend transitions cleanly from payment QR to access QR.

## 100. Add expired session state to frontend
Labels: `frontend`, `ux`
Acceptance: expired requests prompt the user to regenerate a fresh session.

## 101. Add frontend error state for Horizon delays
Labels: `frontend`, `ux`
Acceptance: UI explains delayed payment detection without implying failure.

## 102. Add copy button for destination address and memo
Labels: `frontend`, `ux`
Acceptance: manual payment details are easy to copy from the checkout page.

## 103. Add mobile-friendly layout for wallet handoff
Labels: `frontend`, `ux`
Acceptance: checkout works well on phones where wallet switch is common.

## 104. Add demo timer showing token expiry countdown
Labels: `frontend`, `ux`
Acceptance: access pass or pending payment expiry is visible to the user.

## 105. Add verifier demo page or guide
Labels: `docs`, `frontend`, `demo`
Acceptance: project includes a simple demo flow for scanning and verification.

## 106. Add integration test for request -> payment -> token issuance
Labels: `rust`, `testing`, `integration`
Acceptance: a mocked provider covers the full happy path.

## 107. Add integration test for expired unpaid session
Labels: `rust`, `testing`, `integration`
Acceptance: stale sessions do not get tokens issued.

## 108. Add integration test for duplicate matching payment records
Labels: `rust`, `testing`, `integration`
Acceptance: token issuance remains idempotent.

## 109. Add integration test for wrong amount payment
Labels: `rust`, `testing`, `integration`
Acceptance: mismatched amount does not settle the session.

## 110. Add integration test for wrong asset payment
Labels: `rust`, `testing`, `integration`
Acceptance: mismatched asset does not settle the session.

## 111. Add integration test for wrong memo payment
Labels: `rust`, `testing`, `integration`
Acceptance: wrong memo does not settle the session.

## 112. Add integration test for wrong destination payment
Labels: `rust`, `testing`, `integration`
Acceptance: only payments to the intended receiver can settle a session.

## 113. Add integration test for verifier against API-issued token
Labels: `rust`, `testing`, `integration`
Acceptance: issued tokens validate with verifier CLI logic.

## 114. Add property tests for nonce uniqueness
Labels: `rust`, `testing`, `security`
Acceptance: nonce generation is collision-resistant across large samples.

## 115. Add property tests for token serialization stability
Labels: `rust`, `testing`
Acceptance: signed token verification is stable across repeated serialize/deserialize cycles.

## 116. Add fuzz target for token parsing
Labels: `rust`, `testing`, `security`
Acceptance: malformed token input does not panic.

## 117. Add fuzz target for QR decode path in verifier
Labels: `rust`, `testing`, `security`
Acceptance: malformed images do not crash the verifier.

## 118. Add clippy and fmt CI jobs
Labels: `devops`, `rust`, `testing`
Acceptance: pull requests run formatting and lint checks automatically.

## 119. Add offline-friendly build guidance for git dependencies
Labels: `docs`, `devops`
Acceptance: contributors know how to build while legacy git dependencies still exist.

## 120. Unblock workspace builds from legacy Breez git dependency
Labels: `rust`, `build`, `cleanup`
Acceptance: new Stellar crates can be checked without requiring old Lightning dependencies.

## 121. Split legacy and new architectures into separate workspaces or features
Labels: `rust`, `build`, `architecture`
Acceptance: active development path builds independently from archived code.

## 122. Add top-level architecture decision record for Stellar pivot
Labels: `docs`, `architecture`
Acceptance: repo includes an ADR capturing the move from Lightning to Stellar.

## 123. Add contributor guide for project structure
Labels: `docs`, `repo`
Acceptance: new contributors understand crate responsibilities and entry points.

## 124. Add local development quickstart
Labels: `docs`, `dx`
Acceptance: README or `docs/` shows a minimal happy-path dev setup.

## 125. Add sample `.env.example` for Stellar server
Labels: `docs`, `dx`, `stellar`
Acceptance: contributors can copy a template for required env vars.

## 126. Add sample public key file for verifier docs
Labels: `docs`, `cli`
Acceptance: verifier docs show exact expected format for a public key file.

## 127. Add makefile or justfile commands for common tasks
Labels: `dx`, `repo`
Acceptance: common build, run, test, and lint commands are standardized.

## 128. Add cargo aliases for server and verifier
Labels: `dx`, `rust`
Acceptance: developer workflow for running the API and verifier is shorter and documented.

## 129. Add end-to-end demo script for Stellar flow
Labels: `dx`, `demo`, `rust`
Acceptance: script or guide shows session creation, simulated payment, and verification.

## 130. Add mocked payment injection endpoint for demo mode
Labels: `rust`, `demo`, `backend`
Acceptance: local demos can bypass live Horizon while keeping token issuance flow intact.

## 131. Add explicit demo mode config
Labels: `rust`, `demo`, `backend`
Acceptance: demo mode toggles easier polling, permissive startup, and debug responses.

## 132. Prefix demo logs clearly
Labels: `rust`, `demo`, `observability`
Acceptance: logs make it obvious when the server is running in demo mode.

## 133. Add session replay visualization for demos
Labels: `frontend`, `demo`, `ux`
Acceptance: demo UI explains why short-lived tokens matter.

## 134. Add token inspection subcommand to verifier
Labels: `rust`, `cli`, `feature`
Acceptance: verifier can print parsed token fields without only returning pass/fail.

## 135. Add signer identity metadata to tokens
Labels: `rust`, `security`
Acceptance: tokens can expose key id or issuer id for rotation workflows.

## 136. Add key rotation support
Labels: `rust`, `security`, `backend`
Acceptance: verifier can validate against multiple active public keys during rotation.

## 137. Add verifier keyring support
Labels: `rust`, `cli`, `security`
Acceptance: CLI accepts multiple public keys or a key bundle file.

## 138. Add token revocation list support for online-assisted mode
Labels: `rust`, `feature`, `security`
Acceptance: optional online mode can reject revoked tokens while preserving offline core behavior.

## 139. Add event-scoped key rotation support
Labels: `rust`, `security`, `feature`
Acceptance: different events can use different signing keys cleanly.

## 140. Add optional venue or gate identifier to token
Labels: `rust`, `feature`, `security`
Acceptance: tokens may be constrained to a venue or scanner context.

## 141. Add maximum token age enforcement independent of expiry
Labels: `rust`, `security`
Acceptance: verifier can reject tokens older than a configured threshold.

## 142. Add stronger nonce length and alphabet policy
Labels: `rust`, `security`
Acceptance: nonce generation policy is consistent and documented.

## 143. Add signed token size budgeting
Labels: `rust`, `performance`, `security`
Acceptance: token schema changes are measured against QR scannability targets.

## 144. Add benchmark for watcher throughput with many pending sessions
Labels: `rust`, `performance`, `testing`
Acceptance: performance profile exists for hundreds or thousands of active sessions.

## 145. Improve watcher matching complexity
Labels: `rust`, `performance`, `backend`
Acceptance: session lookup scales better than scanning every pending request on every tick.

## 146. Add memo index to payment service
Labels: `rust`, `performance`, `backend`
Acceptance: pending sessions can be found directly by memo.

## 147. Add destination + memo + amount composite matching key
Labels: `rust`, `performance`, `backend`
Acceptance: watcher matching becomes deterministic and efficient.

## 148. Add concurrency test for simultaneous session creation
Labels: `rust`, `testing`, `backend`
Acceptance: high parallel request volume does not corrupt state.

## 149. Add concurrency test for simultaneous payment settlement
Labels: `rust`, `testing`, `backend`
Acceptance: duplicate issuance and race conditions are prevented.

## 150. Add locks or transactional semantics for mark-paid flow
Labels: `rust`, `backend`, `bug`
Acceptance: state transitions remain atomic under concurrent watcher events.

## 151. Add server shutdown handling for background watcher
Labels: `rust`, `backend`, `ops`
Acceptance: watcher exits cleanly on process shutdown.

## 152. Add graceful shutdown support in Axum main
Labels: `rust`, `backend`, `ops`
Acceptance: process handles SIGINT/SIGTERM without dropping in-flight work abruptly.

## 153. Add configurable bind address and port
Labels: `rust`, `backend`, `ops`
Acceptance: server bind target is not hardcoded to `0.0.0.0:3000`.

## 154. Add CORS configuration controls
Labels: `rust`, `backend`, `security`
Acceptance: allowed origins are configurable instead of always `Any`.

## 155. Add CSRF/threat note for browser-based flows
Labels: `docs`, `security`
Acceptance: docs explain browser exposure and recommended deployment boundaries.

## 156. Add auth layer for operator endpoints if introduced
Labels: `rust`, `security`, `backend`
Acceptance: non-public administrative routes are protected.

## 157. Add TLS termination deployment guidance
Labels: `docs`, `ops`
Acceptance: deployment docs show safe exposure behind reverse proxies.

## 158. Add Dockerfile for API server
Labels: `devops`, `rust`, `ops`
Acceptance: API server can be containerized reproducibly.

## 159. Add docker-compose or equivalent local stack
Labels: `devops`, `dx`
Acceptance: local development with API and mocked dependencies is easy to launch.

## 160. Add release profile optimization review
Labels: `rust`, `performance`
Acceptance: binaries are tuned for startup size and runtime as appropriate.

## 161. Add supply-chain review for community Stellar dependencies
Labels: `security`, `rust`, `stellar`
Acceptance: dependency choices are documented and reviewed.

## 162. Add semantic versioning policy for token crate
Labels: `docs`, `rust`
Acceptance: breaking token format changes follow a documented versioning strategy.

## 163. Add `serde` compatibility tests across versions
Labels: `rust`, `testing`
Acceptance: token JSON remains stable where required.

## 164. Move token verification rules into shared validator module
Labels: `rust`, `refactor`
Acceptance: CLI and server-side token inspection share common validation logic.

## 165. Add server-side token inspection endpoint for debug mode
Labels: `rust`, `feature`, `api`
Acceptance: debug mode can parse and echo token claims safely.

## 166. Add human-readable payment summaries in API responses
Labels: `rust`, `api`, `ux`
Acceptance: responses expose friendly labels for demos without losing machine-readable fields.

## 167. Add locale-safe amount formatting helper
Labels: `rust`, `ux`
Acceptance: UI and logs use consistent decimal formatting for Stellar amounts.

## 168. Add webhook-style notification hook for payment settlement
Labels: `rust`, `feature`, `backend`
Acceptance: integrations can subscribe to token issuance events.

## 169. Add internal event bus between watcher and token issuer
Labels: `rust`, `architecture`, `backend`
Acceptance: background components are more decoupled and testable.

## 170. Add domain service docs for `payment_service` and `access_service`
Labels: `docs`, `rust`
Acceptance: maintainers can understand service boundaries quickly.

## 171. Split `api_server` crate into smaller modules if growth continues
Labels: `rust`, `refactor`, `architecture`
Acceptance: crate structure stays navigable as new features land.

## 172. Add lint rule or CI check for TODO/FIXME debt
Labels: `repo`, `dx`
Acceptance: debt markers are tracked intentionally rather than silently accumulating.

## 173. Add issue templates for bugs and features
Labels: `repo`, `github`
Acceptance: future GitHub issues use consistent templates.

## 174. Add PR template tailored to payment/security changes
Labels: `repo`, `github`
Acceptance: contributors are prompted to cover token, verifier, and payment implications.

## 175. Add CODEOWNERS for critical security-sensitive areas
Labels: `repo`, `security`, `github`
Acceptance: token and verifier changes request review from the right maintainers.

## 176. Add repository labels for architecture, provider, verifier, and frontend work
Labels: `repo`, `github`
Acceptance: GitHub label taxonomy exists for triage.

## 177. Bulk-create these backlog items as real GitHub issues
Labels: `repo`, `github`, `automation`
Acceptance: all drafted issues from this file are published once auth is fixed.

## 178. Add script to create GitHub issues from backlog file
Labels: `automation`, `github`, `dx`
Acceptance: one command can publish issue drafts through `gh`.

## 179. Add deduplication logic for bulk issue creation
Labels: `automation`, `github`
Acceptance: rerunning the importer does not create duplicate issues.

## 180. Add milestone plan for Stellar MVP
Labels: `planning`, `github`
Acceptance: backlog maps to concrete phases like MVP, hardening, and expansion.

## 181. Add issue labels for `stellar`, `security`, `demo`, and `multi-chain`
Labels: `planning`, `github`
Acceptance: imported issues can be triaged quickly.

## 182. Add sample Horizon response fixtures to repo
Labels: `rust`, `testing`, `stellar`
Acceptance: parser tests use realistic captured payloads.

## 183. Add memo length limit enforcement
Labels: `rust`, `stellar`, `bug`
Acceptance: generated memos always fit Stellar constraints.

## 184. Add asset-specific validation for amount precision
Labels: `rust`, `stellar`, `bug`
Acceptance: amounts are checked against asset precision and formatting rules.

## 185. Add funding/account-balance preflight check
Labels: `rust`, `stellar`, `ops`
Acceptance: startup can warn when destination account is unfunded or unreachable.

## 186. Add support for SEP-10 or wallet-authenticated operator flows
Labels: `rust`, `feature`, `stellar`
Acceptance: optional authenticated admin workflows can use Stellar-native auth.

## 187. Add optional Soroban integration exploration doc
Labels: `docs`, `research`, `stellar`
Acceptance: repo captures whether smart-contract support is useful for future access features.

## 188. Add multi-asset payment request examples in tests
Labels: `rust`, `testing`, `stellar`
Acceptance: examples cover XLM and at least one issued asset.

## 189. Add scanner-side library crate separate from CLI
Labels: `rust`, `architecture`, `cli`
Acceptance: verification logic can be embedded in other apps beyond the command line.

## 190. Add WebAssembly verifier target exploration
Labels: `rust`, `research`, `feature`
Acceptance: feasibility of browser-based offline verification is documented or prototyped.

## 191. Add mobile verifier integration notes
Labels: `docs`, `feature`, `cli`
Acceptance: project documents how the verification crate could power handheld scanners.

## 192. Add event capacity or ticket class claim to token
Labels: `rust`, `feature`
Acceptance: token can represent different access tiers or classes.

## 193. Add one-time scan consumption mode for semi-online deployments
Labels: `rust`, `feature`, `security`
Acceptance: optional mode can record scan use while preserving offline-first core.

## 194. Add fraud-analysis notes for screenshot sharing scenarios
Labels: `docs`, `security`
Acceptance: docs explain tradeoffs of offline verification without central scan tracking.

## 195. Add event-specific branding/custom payload support
Labels: `rust`, `feature`, `ux`
Acceptance: access tokens or API responses can carry presentational event metadata.

## 196. Add repository roadmap section aligned with backlog
Labels: `docs`, `planning`
Acceptance: top priorities are easy to understand from the README.

## 197. Add changelog for architecture migration
Labels: `docs`, `repo`
Acceptance: repo tracks major milestones from Lightning to Stellar.

## 198. Add migration guide for any Lightning-era integrators
Labels: `docs`, `migration`
Acceptance: users of old endpoints know how to move to the Stellar API.

## 199. Add security review checklist for token schema changes
Labels: `security`, `docs`
Acceptance: future token modifications require an explicit security checklist.

## 200. Prepare multi-chain adapter spike after Stellar MVP stabilizes
Labels: `architecture`, `research`, `multi-chain`
Acceptance: document the interface and constraints for adding Lightning or EVM back through `payment_core`.
