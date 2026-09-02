import { routeContactForm } from "../src/contact_router";

async function main() {
  const sample = {
    name: "Sam",
    email: "sam@neighbor.com",
    shipmentId: "SHP-998",
    eventType: "delivered",
    podFileUrl: "https://pod.mylogistics.co/SHP-998.png",
    message: "Got it, thanks!",
  };
  const res = await routeContactForm(sample);
  console.log("Routed contact form, message_id:", res.message_id);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
