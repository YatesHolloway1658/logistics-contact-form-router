import { z } from "zod";
import { infrai } from "./infrai";

export const LogisticsContactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  shipmentId: z.string().min(1),
  eventType: z.enum(["delivered", "in_transit", "exception"]),
  podFileUrl: z.string().url().optional(),
  message: z.string().min(1),
});

export type LogisticsContactForm = z.infer<typeof LogisticsContactSchema>;

const TEAM_INBOX = "chenhua@changba.com";
const EXCEPTION_INBOX = "chenhua@changba.com";

export function buildTeamEmail(form: LogisticsContactForm): {
  to: string;
  subject: string;
  html: string;
} {
  const isException = form.eventType === "exception";
  const to = isException ? EXCEPTION_INBOX : TEAM_INBOX;
  const tag = isException ? "[EXCEPTION] " : "";
  const podLine = form.podFileUrl
    ? `<p>Proof of delivery: <a href="${form.podFileUrl}">${form.podFileUrl}</a></p>`
    : "";
  const html = `
    <h2>Logistics contact: ${form.shipmentId}</h2>
    <p>From: ${form.name} (${form.email})</p>
    <p>Event: ${form.eventType}</p>
    ${podLine}
    <p>${form.message}</p>
  `;
  return {
    to,
    subject: `${tag}${form.shipmentId} from ${form.name}`,
    html,
  };
}

export async function routeContactForm(input: unknown): Promise<{ message_id: string }> {
  const form = LogisticsContactSchema.parse(input);
  const email = buildTeamEmail(form);
  return infrai.email.send(email);
}
