import Anthropic from "@anthropic-ai/sdk";
import type { GenerationResult } from "./types";

const SENDER = {
  name: "Rimon Debnath",
  phone: "01540670260",
  whatsapp: "01818681993",
  email: "rimonok12@gmail.com",
  price: "10,000 BDT",
};

const SYSTEM = `You are an expert brand strategist and web designer who helps a freelance web developer win clients.
Given raw information about a local business (text, a website's content, or a screenshot), you do three things:
1. Extract a clean, structured profile of the business.
2. Write a short, sharp critique of why their current online presence is likely losing them customers (2-3 sentences, specific and honest, not generic).
3. Write a warm, persuasive cold-outreach email proposing a brand-new modern website.

Rules:
- Infer sensibly. If a detail (phone, address) is missing, leave it as an empty string — never invent fake contact details.
- Pick a primary_color and accent_color (hex) that genuinely fit the business's vibe and industry.
- services: 3-6 realistic offerings for this kind of business, with a one-line description each. price optional.
- highlights: 4 short punchy feature phrases (2-4 words each).
- The proposal email must: greet them, name a specific weakness from the critique, promise a modern mobile-friendly site, mention it was built with Next.js, Tailwind and premium animation, state the price (${SENDER.price}), and close with the sender's contact details.
- Sender identity for the email signature: ${SENDER.name}, Phone ${SENDER.phone}, WhatsApp ${SENDER.whatsapp}, Email ${SENDER.email}.
- Respond with ONLY a single valid JSON object, no markdown fences, no commentary.

JSON shape:
{
  "business": {
    "name": string, "type": string, "tagline": string, "vibe": string,
    "primary_color": string, "accent_color": string, "about": string,
    "services": [{ "name": string, "description": string, "price": string }],
    "highlights": [string],
    "location": { "address": string, "phone": string, "email": string, "hours": string },
    "socials": [{ "label": string, "url": string }]
  },
  "critique": string,
  "proposal_email": { "subject": string, "body": string }
}`;

function parseJson(raw: string): GenerationResult {
  let text = raw.trim();
  // Strip accidental code fences
  if (text.startsWith("```")) {
    text = text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  }
  // Grab the outermost JSON object if there's any stray prose
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start > 0 || end < text.length - 1) text = text.slice(start, end + 1);
  return JSON.parse(text) as GenerationResult;
}

export interface GenerateInput {
  mode: "text" | "url" | "image";
  text?: string; // business details, or page text fetched from the URL
  imageBase64?: string; // raw base64 (no data: prefix)
  imageMediaType?: string; // e.g. image/png
  sourceUrl?: string;
}

export async function generate(input: GenerateInput): Promise<GenerationResult> {
  const client = new Anthropic(); // reads ANTHROPIC_API_KEY

  const content: Anthropic.ContentBlockParam[] = [];

  if (input.mode === "image" && input.imageBase64) {
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: (input.imageMediaType as "image/png") || "image/png",
        data: input.imageBase64,
      },
    });
    content.push({
      type: "text",
      text: "This is a screenshot of a business (its storefront, menu, flyer, or current website). Analyze it and produce the JSON profile, critique and proposal email.",
    });
  } else {
    const label =
      input.mode === "url"
        ? `Here is the content of a business's current website${input.sourceUrl ? ` (${input.sourceUrl})` : ""}. It is likely outdated.`
        : "Here are raw details about a business.";
    content.push({
      type: "text",
      text: `${label}\n\n"""\n${(input.text || "").slice(0, 60000)}\n"""\n\nProduce the JSON profile, critique and proposal email.`,
    });
  }

  const response = await client.messages.create({
    model: "claude-opus-5-5",
    max_tokens: 8000,
    system: SYSTEM,
    messages: [{ role: "user", content }],
  });

  if (response.stop_reason === "refusal") {
    throw new Error("The request was declined by the model's safety system.");
  }

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude.");
  }
  return parseJson(textBlock.text);
}
