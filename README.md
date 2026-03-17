# HASKE Stellar Pass ⚡✨

**Payment-settled access that works offline.**

HASKE Stellar Pass is a minimal platform that turns a confirmed Stellar payment
into a cryptographically verifiable access pass that can be checked
**without internet access**.

There are:
- No user accounts
- No ticket database at the gate
- No online verification service during entry

Access is derived directly from confirmed payment settlement.

---

## Scope

**A Stellar payment confirms on-chain and yields a signed access pass that can be verified offline, with no accounts, dashboards, subscriptions, or online gate checks.**

Current build targets:
- Stellar payment request generation
- Payment detection via Horizon account payment queries
- Access token issuance after payment confirmation
- QR encoding for the payment request and access pass
- Offline verifier CLI for signed tokens
- Minimal Axum API for buyer-facing checkout flows

---

## Core Paradigm

Old Lightning model:
- Payment proof = preimage
- Settlement event = `InvoicePaid`
- Trust anchor = HTLC settlement

Current Stellar model:
- Payment proof = transaction hash + ledger inclusion
- Settlement event = confirmed payment operation
- Trust anchor = Stellar consensus + issuer signature

---

## System Architecture

Buyer Phone
|
| (XLM / token payment)
v
Stellar Network
|
| (payment confirmed)
v
Rust API (Axum)
|  - create payment request
|  - monitor address + memo
|  - issue signed access token
v
Access Token (Ed25519)
|
v
QR Encoder
|
v
Gate Verifier (offline CLI)

Data flow from payment to gate entry:
- Buyer requests a payment session from the API.
- API returns a Stellar destination address, amount, asset, memo, and wallet QR payload.
- Buyer pays using a Stellar wallet.
- API polls Horizon for a confirmed payment matching destination, memo, amount, and asset.
- API builds an access token from the confirmed payment details.
- API signs the token with an Ed25519 private key.
- Buyer receives the signed token and QR.
- Gate verifier validates the signature offline and checks expiry.

What runs online vs offline:
- Online: Axum API, Stellar Horizon lookups, token signing service, QR generation.
- Offline: verifier CLI, embedded or supplied Ed25519 public key, token validation logic.

---

## Workspace Layout

The workspace is now split around a pluggable payment layer:

- `crates/api_server`
  Axum server, routes, watcher loop, in-memory session state, and token issuance orchestration.
- `crates/payment_core`
  Payment abstraction traits used by the API layer.
- `crates/stellar_adapter`
  Stellar-specific payment request creation, memo generation, Horizon client logic, and payment parsing.
- `crates/access_token`
  Signed token types plus signing and verification helpers.
- `crates/qr`
  ASCII and PNG QR generation helpers.
- `crates/shared_types`
  Shared request/response structs and payment event types.
- `crates/verifier_cli`
  Offline verifier for signed access tokens and QR images.

The legacy Lightning implementation still exists in `crates/lightning_node` as a reference path during migration, but the new architecture is centered on `api_server` + `stellar_adapter`.

---

## New API

Endpoints exposed by the new server:

- `POST /api/payment-request`
  Creates a Stellar payment request and returns destination, amount, asset, memo, and QR payload.
- `GET /api/payment-status/:session_id`
  Returns whether payment has been detected and, if available, the issued access token and QR.
- `GET /api/access-token/:session_id`
  Returns the same token-bearing status response for access retrieval flows.

Implementation entry point:
- `crates/api_server/src/main.rs`

Route handlers:
- `crates/api_server/src/routes/payment.rs`
- `crates/api_server/src/routes/status.rs`
- `crates/api_server/src/routes/access.rs`

Background watcher:
- `crates/api_server/src/services/watcher_service.rs`

---

## Stellar Payment Detection

Instead of a Lightning node, HASKE now uses Stellar account monitoring.

Payment request format:
- Destination account
- Amount
- Asset
- Unique memo

Detection strategy:
- Generate a unique memo per payment session.
- Query Horizon for recent payments to the configured destination account.
- Match on destination, memo, amount, and asset.
- Only issue an access token after a confirmed matching payment is found.

Current provider implementation:
- `crates/stellar_adapter/src/provider.rs`
- `crates/stellar_adapter/src/client.rs`
- `crates/stellar_adapter/src/parser.rs`
- `crates/stellar_adapter/src/memo.rs`

Default Horizon endpoint:
- `https://horizon-testnet.stellar.org`

---

## Access Token Format

The access token is a signed JSON payload. It is designed for offline verification and now anchors proof to Stellar payment data.

Current token fields:
- `version`
- `event_id`
- `tx_hash`
- `source`
- `amount`
- `asset`
- `memo`
- `ledger`
- `expires_at`
- `nonce`

Compatibility note:
- The token struct still retains an optional `payment_hash` field so older Lightning-shaped tokens can coexist during migration.

Token signing helpers live in:
- `crates/access_token/src/sign.rs`
- `crates/access_token/src/token.rs`
- `crates/access_token/src/verify.rs`

Example token payload before signing:

```json
{
  "version": 1,
  "event_id": "demo-event",
  "tx_hash": "3d5c...abc",
  "source": "GABC...",
  "amount": "10",
  "asset": "XLM",
  "memo": "A9k3Lm2Qx7pR",
  "ledger": 123456,
  "expires_at": 1735689750,
  "nonce": "q8Y2JkP4Ls9Vb0Xr"
}
```

Signed token wire format:

```json
{
  "token": { "...": "..." },
  "signature": "<base64>"
}
```

---

## QR Generation

Requirements covered:
- Terminal QR for development
- PNG QR for demos and browser display
- Deterministic output for the same payload

Implementation lives in:
- `crates/qr/src/lib.rs`

Two kinds of QR payloads are used:
- Stellar wallet payment request QR such as `web+stellar:pay?...`
- Signed access token QR for offline gate validation

---

## Offline Verifier CLI

Behavior:
- Accepts a token string or a QR image
- Verifies Ed25519 signature
- Checks expiry
- Prints `VALID` or `INVALID`
- Makes no network calls

CLI examples:
- `verifier --token "<signed_token_json>"`
- `verifier --qr-image path/to/qr.png`
- `verifier --public_key path/to/public_key.txt --token "<signed_token_json>"`

Implementation lives in:
- `crates/verifier_cli/src/main.rs`

Note:
- The CLI currently expects either `--public_key` or a rebuilt binary with an embedded real public key value.

---

## Configuration

New server environment variables:

- `STELLAR_DESTINATION_ADDRESS`
  Required. Stellar account that receives payments.
- `STELLAR_HORIZON_URL`
  Optional. Defaults to `https://horizon-testnet.stellar.org`.
- `HASKE_SIGNING_KEY_BASE64`
  Optional but recommended. Base64-encoded 32-byte Ed25519 secret key seed for stable signing.
- `HASKE_TOKEN_EXPIRY_SECS`
  Optional. Defaults to `300`.
- `HASKE_WATCH_INTERVAL_SECS`
  Optional. Defaults to `3`.

Behavior note:
- If `HASKE_SIGNING_KEY_BASE64` is not set, the API generates an ephemeral signing key on startup. That is fine for quick demos but invalidates previously issued passes after restart.

---

## Threat Model

- Fake payment claim: issue access only after Horizon confirms a matching payment for destination, memo, amount, and asset.
- Screenshot reuse: short token expiry limits how long a captured access QR remains usable.
- Replay attack: nonce and event scoping reduce simple token reuse, though preventing repeat entry without a database remains intentionally out of scope for this demo.
- Memo collision: unique generated memos keep payment sessions distinct.
- Fake QR codes: Ed25519 signatures ensure only issuer-signed passes validate offline.
- Clock drift: verifier devices should allow small time tolerance and stay roughly synced.

---

## Demo Narrative

One sentence:
- This platform turns a confirmed blockchain payment into a time-limited access pass that still verifies offline at the door.

One paragraph:
- A guest opens a checkout screen, pays a Stellar request from their wallet, and receives a signed QR pass moments later. Staff at the venue can scan that pass with no network connection because the verifier only needs the issuer public key and the signed token payload. The result is a smooth pay-to-enter flow that keeps working during poor connectivity.

Simple diagram:
- Phone payment -> signed QR pass -> offline door scanner -> entry

---

## Demo Script

Setup context:
- "This is a pay-to-enter flow where the gate has no internet, but the pass still verifies."

Show payment:
- "The buyer gets a Stellar payment request with an amount and unique memo."
- "Once the payment confirms, the system issues an access pass tied to that transaction."

Verify access offline:
- "Now the gate device scans the signed QR."
- "It verifies locally, with no Horizon call and no server lookup."

Wrap-up:
- "So the venue gets reliable entry even during connectivity problems, and the payment still maps cleanly to access."

---

## What This Demonstrates

- Blockchain payment-to-access conversion using Stellar
- Cryptographically signed access passes
- Offline verification at the point of entry
- A payment abstraction that can support additional chains later

This repository is built as an **investor demo**, not a full production system.

---

## Positioning

HASKE is no longer best thought of as a Lightning-only project.

It is better described as:

**A proof-of-payment to access protocol, with Stellar as the current payment rail.**

That opens the path to:
- XLM
- USDC on Stellar
- Future Lightning reintroduction through the same payment abstraction
- Other chains through additional adapters

---

## Current Limitations

- Session state is in-memory and does not survive restarts.
- The verifier does not yet ship with a real embedded public key by default.
- The old Lightning crate is still present in the repo during migration.
- The frontend checkout pages still need to be updated to call the new Stellar endpoints.

---

## License

MIT
