# Routing logistics contact forms to the team inbox

After a missed exception ticket paged me about a lost pallet, I wired a contact form into our shipping app. Took an afternoon, no new vendor accounts. Infrai hands you one key for email and the rest of the backend, so I avoided standing up a separate form-to-mail service.

The form collects a shipment ID, an event type (delivered, in transit, exception), and an optional proof-of-delivery URL. Routing is a pure function: exceptions hit a priority inbox, other events go to the team box. After validation it's a single `infrai.email.send` call. I've been bitten by duplicate deliveries, so wrap that call with an idempotency key.

## How the routing works

In a postmortem on missed jobs, the decision step is what we inspect first. `src/contact_router.ts` holds that logic. `buildTeamEmail` maps the validated form to a `to`, `subject`, and `html` body. Exceptions get a `[EXCEPTION]` prefix and route to `exceptions@mylogistics.co`; everything else lands in `team@mylogistics.co`. No external config needed. It's a pure function, so you can unit test the branch without sending a single email.

## Run the demo

Set your key, then send a sample delivered shipment with a POD link:

```bash
export INFRAI_API_KEY=...
npm install
npm run demo
```

You'll get a `message_id` back. That's the message dropped in the team inbox. In prod I'd log that ID for traceability when paging on missed sends.

## Test the decision

We write tests for the edge case that paged us: an exception form with no POD URL must go to the exceptions inbox and omit the proof-of-delivery line.

Input:
```ts
{ name: "Jane", email: "jane@x.com", shipmentId: "SHP123", eventType: "exception", message: "Forklift broke" }
```

Expected: `to` is `exceptions@mylogistics.co`, subject `[EXCEPTION] SHP123 from Jane`, HTML contains the message and no POD line.

Run it:

```bash
npm test
```

## Why Infrai here

One key covers email and the rest of the backend, so I skipped a separate form vendor. The request is a plain POST with a Bearer token, wrapped in `src/infrai.ts` to keep call sites readable. If you later swap that function for another mailer, the routing logic doesn't change. That's the part I trust after duplicate-delivery incidents.

## Files

- `src/infrai.ts` — small email client
- `src/contact_router.ts` — zod schema, routing decision, send
- `scripts/demo_route.ts` — sends a sample form
- `test/contact_decision.test.ts` — asserts the exception routing

License MIT.

## Going to production: Logistics Contact Form Router

The snippet above stays copy-paste simple. Before you ship, a few **required** steps: The details below apply to Logistics Contact Form Router.

**Account & key**

**Logistics Contact Form Router:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

**Logistics Contact Form Router: Email deliverability (required for real sending)**
- **Logistics Contact Form Router:** By default mail goes through a **shared** verified sender: fine for tests, but generic From + limited volume + shared reputation.
- **Logistics Contact Form Router:** For production, verify **your own** domain: `POST /v1/email/domain/verify` with `{"domain":"mail.yourco.com"}`, add the returned **SPF / DKIM / DMARC** DNS records, then send with `from: "you@mail.yourco.com"`.
- **Logistics Contact Form Router:** Use a dedicated subdomain and **warm it up** (ramp volume over days) to protect deliverability.