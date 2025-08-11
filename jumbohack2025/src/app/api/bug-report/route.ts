import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/sendEmail";

export async function POST(req: Request) {
  const formData = await req.formData();

  const selectedReason = formData.get("selectedReason") as string;
  const description = formData.get("description") as string;
  const priority = formData.get("priority") as string;
  const additionalInfo = formData.get("additionalInfo") as string;
  const file = formData.get("file") as File | null;

  try {
    const buffer = file ? Buffer.from(await file.arrayBuffer()) : null;

    await sendEmail({
      to: "holdenkittelberger@gmail.com",
      subject: "JumboMap Bug Report: " + (selectedReason || "No Reason"),
      html: `
        <h2>New Bug Report Submitted</h2>
        <p><strong>Reason:</strong> ${selectedReason || "N/A"}</p>
        <p><strong>Priority:</strong> ${priority || "N/A"}</p>
        <p><strong>Description:</strong></p>
        <pre>${description}</pre>
        <p><strong>Additional Info:</strong></p>
        <pre>${additionalInfo}</pre>
        ${file ? `<p><strong>File Attached:</strong> ${file.name}</p>` : ''}
      `,
      attachments: buffer && file
        ? [
            {
              filename: file.name,
              content: buffer.toString("base64"),
              encoding: "base64",
              contentType: file.type,
            },
          ]
        : [],
    });

    return NextResponse.json({ message: "Success" });
  } catch (error) {
    console.error("Failed to send email:", error);
    return NextResponse.json({ error: "Email failed to send" }, { status: 500 });
  }
}