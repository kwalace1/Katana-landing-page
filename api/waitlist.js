import { submitWaitlist } from "../lib/inquiries.mjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed." });
  }

  try {
    const result = await submitWaitlist(req.body || {});
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error("Waitlist handler failed:", error);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}
