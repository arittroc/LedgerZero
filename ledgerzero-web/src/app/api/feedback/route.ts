import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { logger } from "@/lib/logger";

export async function POST(request: Request) {
  const userId = (await headers()).get("x-user-id");

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { message, type } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 },
      );
    }

    const feedback = await prisma.feedback.create({
      data: {
        message,
        type: type || "BUG",
        userId,
      },
    });

    logger.info("Feedback submitted", {
      userId,
      feedbackId: feedback.id,
      type,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("Feedback submission failed", { userId, error });
    return NextResponse.json(
      { error: "Failed to submit feedback" },
      { status: 500 },
    );
  }
}
