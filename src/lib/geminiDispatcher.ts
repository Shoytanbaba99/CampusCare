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

export async function generateGeminiDispatchReply(
  ticketContext: TicketContext,
  studentMessage: string
): Promise<{ text: string }> {
  const safeName = ticketContext.isAnonymous ? "Anonymous Student" : (ticketContext.reporterName || "Student");
  const safeNumber = ticketContext.ticketNumber || "Ticket";
  const safeTitle = ticketContext.title || "Issue Report";
  const safeDept = ticketContext.departmentName || "Maintenance";
  const safeLoc = ticketContext.location || "Campus";
  const safePriority = ticketContext.priority || "Medium";
  const safeStatus = ticketContext.status || "Submitted";
  const safeSla = ticketContext.slaDueAt ? new Date(ticketContext.slaDueAt).toLocaleDateString() : "Soon";

  // Graceful fallback helper
  const fallback = (): { text: string } => {
    return {
      text: `Hello ${safeName}. We have received your message regarding ticket ${safeNumber} (${safeTitle}). The ${safeDept} department is aware of the situation at ${safeLoc}. A staff member will review your update shortly.`,
    };
  };

  if (!process.env.GEMINI_API_KEY) {
    return fallback();
  }

  const systemInstruction = `You are the CampusCare AI Operations Dispatcher.
Your task is to reply to the student's message based on the ticket context.
Address the student as "${safeName}".
Reference the department (${safeDept}), location (${safeLoc}), priority (${safePriority}), and SLA target repair date (${safeSla}).
If staff posted updates, use the progress notes summary: "${ticketContext.progressNotesSummary || 'No staff logs yet'}".
Keep responses helpful, polite, and concise (2-4 sentences max).`;

  const requestBody = {
    system_instruction: {
      parts: [{ text: systemInstruction }]
    },
    contents: [
      {
        role: "user",
        parts: [{ text: `Ticket Details:\nNumber: ${safeNumber}\nTitle: ${safeTitle}\nDescription: ${ticketContext.description || ''}\nStatus: ${safeStatus}\n\nStudent Message:\n${studentMessage}` }]
      }
    ]
  };

  const candidateModels = [
    "gemini-3.5-flash",
    "gemini-3.1-flash-lite",
    "gemini-2.5-flash",
    "gemini-1.5-flash",
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
        }
      );

      if (response.ok) {
        const data = await response.json();
        const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        if (replyText.trim()) {
          return { text: replyText.trim() };
        }
      } else {
        console.warn(`Model ${model} returned status ${response.status}, trying next fallback...`);
      }
    } catch (err) {
      console.warn(`Error querying model ${model}:`, err);
    }
  }

  return fallback();
}
