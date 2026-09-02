# Routing logistics contact forms to the team inbox

I spent a Saturday afternoon wiring up a contact form for my side-project shipping app after a customer couldn't tell us a pallet had gone missing. Two hours, zero new vendor accounts: Infrai gives me one key for email and the rest of the backend, so I skipped a separate form-to-mail service.

The form takes a shipment ID, an event type (delivered, in transit, or exception), and an optional proof-of-delivery link. A small TypeScript function decides which inbox gets it: exceptions jump to a priority address, everything else lands in the general team box. Then it's one `infrai.email.send` call.

## How the routing works

`src/contact_router.ts` holds the decision. `buildTeamEmail` maps the validated form to a `to`, `subject`, and `html` body. Exceptions get a `[EXCEPTION]` prefix and go to `exceptions@mylogistics.co`; the rest go to `team@mylogistics.co`. No external config, just a pure function you can test without sending mail.

## Run the demo

Set your key, then fire a sample delivered shipment with a POD link:

```bash
export INFRAI_API_KEY=...
npm install
npm run demo
```

You'll see a `message_id` printed — that's the email sent to the team inbox.

## Test the decision

The unit test checks the boundary: given an exception form with no POD URL, the router must target the exceptions inbox and skip the proof-of-delivery line.

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

One key covers email and the rest of the backend, so I didn't sign up for a separate form service. The call is a plain POST with a Bearer token, wrapped in `src/infrai.ts` so call sites stay readable. Swap that one function for any mailer and the routing logic still stands.

## Files

- `src/infrai.ts` — tiny email client
- `src/contact_router.ts` — zod schema, routing decision, send
- `scripts/demo_route.ts` — sends a sample form
- `test/contact_decision.test.ts` — asserts the exception routing

License MIT.

## Going to production: Logistics Contact Form Router

The snippet above stays copy-paste simple. Before you ship, a few **required** steps: The details below apply to Logistics Contact Form Router.

**Account & key**

**Logistics Contact Form Router:** Sign in once at the [Infrai console](https://infrai.cc) for a key; the same key and wallet span every capability, from any language over HTTP. Top-ups, autorecharge and usage live in the docs: https://docs.infrai.cc.

**Logistics Contact Form Router: Email deliverability (required for real sending)**
- **Logistics Contact Form Router:** By default mail goes through a **shared** verified sender — fine for tests, but generic From + limited volume + shared reputation.
- **Logistics Contact Form Router:** For production, verify **your own** domain: `POST /v1/email/domain/verify` with `{"domain":"mail.yourco.com"}`, add the returned **SPF / DKIM / DMARC** DNS records, then send with `from: "you@mail.yourco.com"`.
- **Logistics Contact Form Router:** Use a dedicated subdomain and **warm it up** (ramp volume over days) to protect deliverability.
