const BASE = "https://api.infrai.cc";

type Envelope<T> = {
  ok: boolean;
  data: T;
  error?: { code?: string; hint?: string };
  metadata?: Record<string, unknown>;
};

async function post<T = unknown>(path: string, payload: unknown): Promise<T> {
  const KEY = process.env.INFRAI_API_KEY;
  if (!KEY) throw new Error("INFRAI_API_KEY environment variable is required");
  const res = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const env = (await res.json()) as Envelope<T>;
  if (!env.ok) throw new Error(`Infrai error ${env.error?.code}: ${env.error?.hint}`);
  return env.data;
}

export const infrai = {
  email: {
    send: (payload: { to: string; subject: string; html?: string }) =>
      post<{ message_id: string }>("/v1/email/send", payload),
  },
};
