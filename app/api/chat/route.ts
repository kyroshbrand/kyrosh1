import { GoogleGenerativeAI } from "@google/generative-ai";
import { connectDB } from "@/lib/mongodb";
import { ChatSession } from "@/models/ChatSession";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";
import { getFAQContext } from "@/lib/faq-data";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message, sessionId, userName, userPhone } = body;

    if (!message || typeof message !== "string" || !message.trim()) {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return Response.json({ error: "Gemini API key not configured" }, { status: 500 });
    }

    // Connect to MongoDB
    await connectDB();

    // Find or create chat session
    let session;
    if (sessionId) {
      session = await ChatSession.findById(sessionId);
    }

    if (!session) {
      if (!userName || !userPhone) {
        return Response.json(
          { error: "Name and phone are required to start a chat" },
          { status: 400 }
        );
      }
      session = new ChatSession({
        name: userName.trim(),
        phone: userPhone.trim(),
        messages: [],
      });
    }

    // Add user message to session
    session.messages.push({
      role: "user",
      content: message.trim(),
      timestamp: new Date(),
    });

    // Build conversation history for Gemini
    const conversationHistory = session.messages.map((msg: { role: string; content: string }) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // Build the full system instruction
    const faqContext = getFAQContext();
    const fullSystemInstruction = `${SYSTEM_PROMPT}

The user's name is: ${session.name}
The user's phone number is: ${session.phone}

${faqContext}

Remember: Keep responses short (2-4 sentences max), friendly, and always guide toward WhatsApp or a phone call.`;

    // Call Gemini API
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      systemInstruction: fullSystemInstruction,
    });

    const chat = model.startChat({
      history: conversationHistory.slice(0, -1), // all except last (the current msg)
    });

    const result = await chat.sendMessage(message.trim());
    const botReply = result.response.text();

    // Add bot response to session
    session.messages.push({
      role: "bot",
      content: botReply,
      timestamp: new Date(),
    });

    // Save session
    await session.save();

    return Response.json({
      reply: botReply,
      sessionId: session._id.toString(),
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
