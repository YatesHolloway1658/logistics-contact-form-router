import assert from "node:assert";
import { buildTeamEmail, LogisticsContactSchema } from "../src/contact_router";

const input = {
  name: "Jane",
  email: "jane@x.com",
  shipmentId: "SHP123",
  eventType: "exception",
  message: "Forklift broke",
};

const parsed = LogisticsContactSchema.parse(input);
const email = buildTeamEmail(parsed);

assert.strictEqual(email.to, "exceptions@mylogistics.co");
assert.strictEqual(email.subject, "[EXCEPTION] SHP123 from Jane");
assert.match(email.html, /Forklift broke/);
assert.ok(!email.html.includes("Proof of delivery"));

console.log("PASS: exception form routes to exceptions inbox without POD line");
