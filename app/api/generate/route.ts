import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { generate, type GenerateInput } from "@/lib/generate";
import { SAMPLE } from "@/lib/mock";

export const maxDuration = 120;

// Fetch a URL and reduce the HTML to readable text for Claude.
async function fetchPageText(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; DemoBuilder/1.0)" },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`Could not fetch the site (HTTP ${res.status}).`);
  const html = await res.text();
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 50000);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const mode: GenerateInput["mode"] = body.mode;

    // Sample mode, or no API key configured -> return mock so the UI is testable.
    if (body.sample || !process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({
        ...SAMPLE,
        _notice: body.sample ? undefined : "No ANTHROPIC_API_KEY set — showing sample data. Add your key in Vercel to generate for real.",
      });
    }

    const input: GenerateInput = { mode };
    if (mode === "url") {
      if (!body.url) return NextResponse.json({ error: "Please enter a URL." }, { status: 400 });
      input.sourceUrl = body.url;
      input.text = await fetchPageText(body.url);
    } else if (mode === "image") {
      if (!body.imageBase64) return NextResponse.json({ error: "Please upload an image." }, { status: 400 });
      input.imageBase64 = body.imageBase64;
      input.imageMediaType = body.imageMediaType || "image/png";
    } else {
      if (!body.text?.trim()) return NextResponse.json({ error: "Please enter some details." }, { status: 400 });
      input.text = body.text;
    }

    const result = await generate(input);
    return NextResponse.json(result);
  } catch (err) {
    const msg =
      err instanceof Anthropic.AuthenticationError
        ? "Invalid ANTHROPIC_API_KEY."
        : err instanceof Anthropic.RateLimitError
          ? "Rate limited — try again in a moment."
          : err instanceof SyntaxError
            ? "The model returned something unexpected. Try again."
            : err instanceof Error
              ? err.message
              : "Something went wrong.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
