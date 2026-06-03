import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { getMedbotModel } from "@/lib/gemini";

// Define chat session interface with session tracking
interface ChatSession {
  instance: ReturnType<ReturnType<typeof getMedbotModel>["startChat"]> | null;
  hasInitialContext: boolean;
  sessionId: string;
}

// Global chat session state
let chatSession: ChatSession = {
  instance: null,
  hasInitialContext: false,
  sessionId: "",
};

// Constant guidelines that will be sent once
const INITIAL_GUIDELINES = `You are MedBot, an interactive medical assistant chatbot. Your goal is to understand user symptoms through a structured conversation.

CONVERSATION GUIDELINES:
1. If this is the first message, introduce yourself and ask about their main health concern
2. For follow-up messages:
   - Acknowledge their response
   - Ask relevant follow-up questions based on their symptoms
   - Only proceed to recommendations after gathering sufficient information

RESPONSE FORMAT:
## Response
{Your direct response to the user}

## Follow-up Question
{Your next question to gather more information}

## Analysis
- Symptom Analysis: {Brief analysis of symptoms reported so far}
- Specialist Type: {Recommended specialist if enough information gathered}
- Urgency Level: {Any urgent warnings or immediate actions needed}

## Context
{Summary of conversation context for next interaction}

Remember to:
- Ask only one question at a time
- Show empathy while maintaining professionalism
- Flag any potentially serious symptoms
- Keep responses conversational but focused
- Donot waste time in asking irrelevant questions
- ask open-ended questions to gather more information
- ask closed-ended questions to confirm information
- ask leading questions to guide the conversation
- ask clarifying questions to understand the user's response
- ask probing questions to explore the user's symptoms
- make sure to ask about the user's medical history
- at the end of the conversation, provide a summary of the user's symptoms and recommend a specialist if necessary
- your responce should be clear and concise
- make it quick and easy for the user to understand
- come to conclusions based on the information provided
- end the conversation with a follow-up question`;

export async function POST(req: Request) {
  try {
    const { message, isFirstMessage } = await req.json();
    const headersList = await headers();
    const currentSessionId = headersList.get("x-session-id") || "";
    const model = getMedbotModel();

    // Reset session if ID changed or doesn't match
    if (currentSessionId !== chatSession.sessionId) {
      chatSession = {
        instance: null,
        hasInitialContext: false,
        sessionId: currentSessionId,
      };
    }

    // Initialize or reset chat session if needed
    if (isFirstMessage || !chatSession.instance) {
      chatSession.instance = model.startChat();
      chatSession.hasInitialContext = false;
    }

    // Send initial guidelines only once per chat session
    if (!chatSession.hasInitialContext) {
      await chatSession.instance.sendMessage(INITIAL_GUIDELINES);
      chatSession.hasInitialContext = true;
    }

    // Send user message and get response
    const result = await chatSession.instance.sendMessage(message);

    if (!result?.response) {
      throw new Error("Failed to generate response");
    }

    const text = result.response.text();

    if (!text) {
      throw new Error("Empty response from model");
    }

    const structuredResponse = parseInteractiveResponse(text);

    return NextResponse.json({
      response: structuredResponse,
      timestamp: new Date().toISOString(),
      sessionId: chatSession.sessionId,
      hasInitialContext: chatSession.hasInitialContext,
    });
  } catch (error) {
    console.error("MedBot error:", error);
    // Reset chat session completely on error
    chatSession = {
      instance: null,
      hasInitialContext: false,
      sessionId: "",
    };

    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";

    return NextResponse.json(
      {
        error: errorMessage,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}

function parseInteractiveResponse(response: string) {
  const sections = response.split("##").filter((section) => section.trim());

  const parseSection = (title: string): string => {
    const section = sections.find((s) => s.trim().startsWith(title));
    return section?.replace(title, "")?.trim() || "";
  };

  const analysisSection = parseSection("Analysis");
  const analysisLines = analysisSection.split("\n");
  const analysis = {
    symptomAnalysis:
      analysisLines
        .find((line) => line.includes("Symptom Analysis:"))
        ?.split(":")[1]
        ?.trim() || "",
    specialistType:
      analysisLines
        .find((line) => line.includes("Specialist Type:"))
        ?.split(":")[1]
        ?.trim() || "",
    urgencyLevel:
      analysisLines
        .find((line) => line.includes("Urgency Level:"))
        ?.split(":")[1]
        ?.trim() || "",
  };

  return {
    response: parseSection("Response"),
    followUpQuestion: parseSection("Follow-up Question"),
    analysis,
    context: parseSection("Context"),
  };
}
