export interface TicketContext {
  ticketNumber: string;
  reporterName: string;
  title: string;
  description: string;
  departmentName: string;
  categoryName: string;
  location: string;
  priority: string;
  status: string;
  slaDueAt: string;
  progressNotesSummary: string;
  isAnonymous: boolean;
}

export interface ChatHistoryItem {
  sender: string;
  senderName?: string;
  text: string;
}

export async function generateGeminiDispatchReply(
  ticketContext: TicketContext,
  studentMessage: string,
  chatHistory: ChatHistoryItem[] = []
): Promise<{ text: string }> {
  const safeName = ticketContext.isAnonymous ? "Anonymous Student" : (ticketContext.reporterName || "Student");
  const safeNumber = ticketContext.ticketNumber || "Ticket";
  const safeTitle = ticketContext.title || "Issue Report";
  const safeDept = ticketContext.departmentName || "Maintenance";
  const safeLoc = ticketContext.location || "Campus";
  const safePriority = ticketContext.priority || "Medium";
  const safeStatus = ticketContext.status || "Submitted";
  const safeSla = ticketContext.slaDueAt ? new Date(ticketContext.slaDueAt).toLocaleDateString() : "Soon";
  const notesSummary = ticketContext.progressNotesSummary?.trim() || "No activity logs posted yet by staff.";

  // Context-aware fallback if external AI endpoints are unreachable
  const fallback = (): { text: string } => {
    const lower = studentMessage.toLowerCase();
    if (lower.includes("who") || lower.includes("name") || lower.includes("feed") || lower.includes("found")) {
      return {
        text: `Hello ${safeName}. Staff have not yet recorded specific handler details in the activity logs for ticket ${safeNumber}. The ${safeDept} team has been notified at ${safeLoc} and will post an update here soon.`,
      };
    }
    if (lower.includes("when") || lower.includes("time") || lower.includes("update") || lower.includes("status")) {
      return {
        text: `Hello ${safeName}. Ticket ${safeNumber} is currently marked as "${safeStatus}". The ${safeDept} team is targeting resolution around ${safeSla}.`,
      };
    }
    return {
      text: `Hello ${safeName}. We have noted your message regarding ticket ${safeNumber} (${safeTitle}). The ${safeDept} team at ${safeLoc} will review your inquiry shortly.`,
    };
  };

  if (!process.env.GEMINI_API_KEY) {
    return fallback();
  }

  const systemInstruction = `You are the CampusCare AI Operations Dispatcher for a university campus.
Your job is to converse naturally and helpfully with the student regarding their specific ticket.
Address the student as "${safeName}".
Current Ticket Context:
- Ticket Number: ${safeNumber}
- Title: ${safeTitle}
- Description: ${ticketContext.description || 'N/A'}
- Department: ${safeDept}
- Location: ${safeLoc}
- Priority: ${safePriority}
- Current Status: ${safeStatus}
- SLA Target: ${safeSla}
- Activity Feed / Staff Progress Notes: "${notesSummary}"

Instructions:
- Directly answer the student's question based on the ticket context, activity feed, and prior conversation.
- If they ask about specific details (e.g. who has an item, specific people, or exact timestamps) that are not in the notes, explain clearly that staff haven't logged that detail yet.
- Be conversational and avoid repeating the exact same phrasing across responses.
- Keep answers polite, concise, and informative (2 to 3 sentences).`;

  // Format recent chat history (last 5 messages) for conversational continuity
  const recentHistoryText = (chatHistory || [])
    .slice(-5)
    .map((m) => `${m.senderName || m.sender}: ${m.text}`)
    .join("\n");

  const promptText = recentHistoryText
    ? `[Prior Conversation in this Live Chat]:\n${recentHistoryText}\n\n[Student's Latest Message]:\n${studentMessage}`
    : `[Student's Message]:\n${studentMessage}`;

  const requestBody = {
    system_instruction: {
      parts: [{ text: systemInstruction }],
    },
    contents: [
      {
        role: "user",
        parts: [{ text: promptText }],
      },
    ],
  };

  // High-availability candidate models prioritized by current responsiveness and quota health
  const candidateModels = [
    "gemini-3.5-flash-lite",
    "gemini-flash-lite-latest",
    "gemini-3.8-flash",
    "gemini-3.5-flash",
  ];

  for (const model of candidateModels) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
          signal: AbortSignal.timeout(4000),
        }
      );

      if (response.ok) {
        const data = await response.json();
        const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        if (replyText.trim()) {
          return { text: replyText.trim() };
        }
      } else {
        console.warn(`Model ${model} returned status ${response.status}, failing over to next model...`);
      }
    } catch (err) {
      console.warn(`Error querying model ${model}:`, (err as Error).name || err);
    }
  }

  return fallback();
}
