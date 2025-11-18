import { NextRequest, NextResponse } from "next/server";
import ImageKit from "imagekit";
import axios from "axios";
import { resume } from "react-dom/server";

//@ts-ignore
export const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_URL_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_URL_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    console.log("file", formData);
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResponse = await imagekit.upload({
      file: buffer,
      fileName: `upload-${Date.now()}.pdf`,
      isPrivateFile: false, //optional
      useUniqueFileName: true,
    });

    //call n8n webhook to process the file
    const result = await axios.post(
      "http://localhost:5678/webhook/generate-interview-question",
      {
        resumeUrl: uploadResponse?.url,
      }
    );
    console.log(result.data);

    // The webhook response structure (logged above) shows the questions embedded as
    // JSON text in: result.data.content.parts[0].text
    // Extract and parse that into a proper JS array before returning.
    const rawText = result?.data?.content?.parts?.[0]?.text;

    // Normalize parsed questions into an array so the client always receives the
    // `questions` field (Convex validator requires it).
    let questionsArray: any[] = [];
    if (typeof rawText === "string") {
      try {
        const parsed = JSON.parse(rawText);
        if (Array.isArray(parsed)) {
          questionsArray = parsed;
        } else {
          console.warn(
            "Parsed webhook JSON is not an array, returning empty questions array."
          );
        }
      } catch (e) {
        console.error("Failed to parse questions JSON text:", e);
      }
    } else if (Array.isArray(rawText)) {
      questionsArray = rawText;
    }

    // Re-order each QA object so `question` appears before `answer` when
    // serialized. Property order doesn't affect semantics, but this makes the
    // stored documents easier to read in the dashboard.
    const orderedQuestions = questionsArray.map((q: any) => ({
      question: q?.question ?? q?.prompt ?? null,
      answer: q?.answer ?? q?.response ?? null,
    }));

    // Return the normalized questions array (possibly empty) and resumeUrl so the
    // client can pass both to the Convex mutation.
    return NextResponse.json(
      { questions: orderedQuestions, resumeUrl: uploadResponse?.url },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
