import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    // Call the n8n webhook with messages
    const result = await axios.post(
      "http://localhost:5678/webhook/6b59b861-b232-41e5-b5ca-e2885ddefce2",
      {
        messages: JSON.stringify(messages),
      }
    );

    console.log("webhook raw response:", result.data);

    // Extract the raw text from webhook response
    // Structure: [{ text: "JSON string" }] or result.data.content.parts[0].text
    let rawText: string | null = null;

    if (Array.isArray(result.data) && result.data[0]?.text) {
      rawText = result.data[0].text;
    } else if (result?.data?.content?.parts?.[0]?.text) {
      rawText = result.data.content.parts[0].text;
    } else {
      rawText = result?.data ?? null;
    }

    console.log("extracted feedback text:", rawText);

    // Parse the feedback response
    let feedbackData: any = {};
    if (typeof rawText === "string") {
      try {
        // Try to parse as JSON first
        const stripped = rawText
          .replace(/```(?:json)?/gi, "")
          .replace(/```/g, "")
          .trim();

        // Extract JSON if wrapped in text
        const jsonMatch = stripped.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if (jsonMatch) {
          feedbackData = JSON.parse(jsonMatch[0]);
        } else {
          feedbackData = JSON.parse(stripped);
        }
      } catch (parseError) {
        console.warn(
          "Could not parse feedback JSON, returning raw text:",
          parseError
        );
        feedbackData = { feedback: rawText };
      }
    } else if (rawText && typeof rawText === "object") {
      feedbackData = rawText;
    }

    console.log("parsed feedback:", feedbackData);

    return NextResponse.json({ feedback: feedbackData }, { status: 200 });
  } catch (error) {
    console.error("Error processing feedback:", error);
    return NextResponse.json(
      { error: "Failed to process interview feedback" },
      { status: 500 }
    );
  }
}
