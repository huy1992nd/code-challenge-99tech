## Problem 6: Live Scoreboard Module Specification

### Objective
Design a backend module enabling secure score updates and live top-10 scoreboard broadcasting.

### High-level Overview
- Users perform actions in the product; an authorised event triggers a score increment.
- Backend validates the request, updates persistent storage, and pushes live updates to subscribed clients.
- Leaderboard shows the top 10 scores with low latency and strong anti-abuse controls.

### Non-Functional Requirements
- Latency: p95 < 150 ms for write; < 100 ms for read.
- Throughput: scalable to thousands of updates/min.
- Consistency: scoreboard reflects committed writes within 1-2 seconds.
- Security: prevent spoofing/replay; enforce authz.
- Availability: no single point of failure.

### Data Model
- `User { id: string, displayName: string, ... }`
- `Score { userId: string (PK/FK), value: number, updatedAt: Date }`
- Aggregates:
  - `LeaderboardTop10 { entries: Array<{ userId, displayName, score }>, version: number, updatedAt }`

Relational example (PostgreSQL):
- `users(id pk, display_name)`
- `scores(user_id pk fk, value int not null default 0, updated_at timestamptz not null default now())`

### APIs
1) Update Score (authenticated, idempotent)
   - `POST /v1/scores/increment`
   - Headers: `Authorization: Bearer <JWT>`; `Idempotency-Key: <uuid>`
   - Body: `{ delta: number, actionId: string }`
   - Response: `200 { userId, score, appliedDelta, leaderboardVersion }`
   - Semantics: increases user score by `delta` if the `actionId` is authorised and not yet consumed.

2) Get Leaderboard
   - `GET /v1/leaderboard/top?limit=10`
   - Response: `200 { entries: [{ userId, displayName, score }], version, updatedAt }`

3) Subscribe to Live Leaderboard
   - WebSocket: `GET /v1/leaderboard/stream`
   - Auth: JWT in query/header; connection upgraded to WS.
   - Server pushes `{ type: 'leaderboard.update', version, entries }` after each change or on interval debounced batching.

### Authorisation & Anti-abuse
- AuthN: JWT issued by auth service (short-lived access tokens; refresh via normal flows).
- AuthZ: user can only increment their own score; server derives `userId` from JWT, ignores client-sent userId.
- Action authorisation: `actionId` must be validated via:
  - Signed action receipt from a trusted service (HMAC signature header with rotating secret and timestamp), or
  - Server-side verification against an internal job/event log.
- Idempotency: require `Idempotency-Key` per `actionId`; persist keys with TTL to avoid replay.
- Rate limiting: sliding window per user (e.g., 60 updates/min) + spike protection.
- Input validation: schema validation (delta positive small int, e.g., 1..100) and bounds checks.
- Replay protection: signed timestamp with max skew (e.g., 2 min), nonce cache.

### Storage & Caching
- Primary store: PostgreSQL (transactional update with `scores.value = scores.value + $1`).
- Cache: Redis for:
  - Top-10 leaderboard as a sorted set `leaderboard:zset` (`ZINCRBY`, `ZREVRANGE 0 9`).
  - Idempotency and nonce store.
  - Pub/Sub channel `leaderboard:updates` to fan-out to WS nodes.
- Consistency model: write-through — on successful DB TX, update Redis zset and publish update; background reconciliation ensures Redis matches DB.

### Update Flow (write path)
1. Client sends `POST /v1/scores/increment` with JWT, Idempotency-Key, signed action.
2. API gateway / middleware validates JWT, rate limits.
3. Verify HMAC signature and timestamp; check idempotency store for key; reject replays.
4. Begin DB transaction:
   - Lock row `scores where user_id = $user` using `SELECT ... FOR UPDATE`.
   - Validate `delta` and business rules.
   - `UPDATE scores SET value = value + $delta, updated_at = now()`; upsert if missing.
   - Persist idempotency record `(key, userId, actionId, appliedDelta)`.
5. Commit; update Redis `ZINCRBY leaderboard:zset $delta $userId`; publish to `leaderboard:updates`.
6. WS service receives Pub/Sub message, fetches top-10 from Redis, broadcasts to subscribers; also increments a `version`.

### Read Path
- `GET /v1/leaderboard/top`: serve from Redis top-10; on cache miss, compute from DB and warm cache.

### WebSocket Delivery
- Stateless WS nodes subscribe to `leaderboard:updates`.
- Broadcast debounced (e.g., 100 ms) to bundle rapid updates; include `version` and `entries`.
- Heartbeats and auto-reconnect support.

### Observability
- Structured logs with correlation ID.
- Metrics: update latency, WS fan-out time, Redis/DB errors, rate limit rejections.
- Tracing: spans for request → DB → cache → publish.

### Failure Handling
- If Redis publish fails after DB commit: retry with backoff; compensating job reads latest top-10 and rebroadcasts.
- If Redis is down: continue DB write, queue outbox event for later publish.
- If DB transient error: retry TX with jitter; respect idempotency.

### Security Notes
- HMAC secret rotation, minimum TLS 1.2.
- JWT audience/issuer/exp checks; short TTL.
- Strict validation on `delta` and `actionId`.

### Implementation Outline (suggested)
- Express/Nest HTTP service for APIs.
- WebSocket service (WS/SockJS) sharing Redis.
- Prisma models: `User`, `Score`, `IdempotencyKey(actionId, key, userId, createdAt)`.
- Redis keys: `leaderboard:zset`, `idemp:<key>`, `nonce:<nonce>`.
- Background jobs: reconciliation and rebroadcast.

### Additional Improvements
- Global leaderboard partitions and per-region aggregation.
- Anti-cheat heuristics: anomaly detection on `delta` frequency/magnitude.
- Snapshotting leaderboard to object storage for audit.

See `diagram.yaml` for an execution-flow diagram.
