"use server";

import {
  getChatState,
  appendChatMessage,
  setChatMode,
  setEmergencyAlert,
  getActiveChatComplaintIds,
  ChatMessage,
} from "@/lib/chatStore";
import { generateGeminiDispatchReply, TicketContext } from "@/lib/geminiDispatcher";

export async function fetchActiveChatsAction() {
  try {
    const activeIds = await getActiveChatComplaintIds();
    return { success: true, activeIds };
  } catch (error) {
    return { success: false, activeIds: [] };
  }
}

export async function fetchChatStateAction(complaintId: string) {
  try {
    const state = await getChatState(complaintId);
    return { success: true, state };
  } catch (error) {
    console.error("Failed to fetch chat state:", error);
    return { success: false, error: "Failed to fetch chat state" };
  }
}

export async function postStudentChatMessageAction(
  complaintId: string,
  text: string,
  ticketContext: TicketContext
) {
  try {
    const studentMsg: ChatMessage = {
      id: "msg-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
      sender: "student",
      senderName: ticketContext.isAnonymous ? "Anonymous Student" : (ticketContext.reporterName || "Student"),
      text,
      timestamp: new Date().toISOString(),
    };

    await appendChatMessage(complaintId, studentMsg);

    let state = await getChatState(complaintId);

    // If chat mode is bot, invoke AI Dispatcher
    if (state && state.mode === "bot") {
      const aiResponse = await generateGeminiDispatchReply(ticketContext, text);

      const botMsg: ChatMessage = {
        id: "msg-" + Date.now() + "-bot",
        sender: "bot",
        senderName: "AI Dispatcher",
        text: aiResponse.text,
        timestamp: new Date().toISOString(),
      };

      await appendChatMessage(complaintId, botMsg);
      state = await getChatState(complaintId);
    }

    return { success: true, state };
  } catch (error) {
    console.error("Failed to post student chat message:", error);
    return { success: false, error: "Failed to post student message" };
  }
}

export async function postStaffChatMessageAction(
  complaintId: string,
  text: string,
  staffName: string
) {
  try {
    const staffMsg: ChatMessage = {
      id: "msg-" + Date.now() + "-staff",
      sender: "staff",
      senderName: staffName || "IT Staff",
      text,
      timestamp: new Date().toISOString(),
    };

    await appendChatMessage(complaintId, staffMsg);

    const state = await getChatState(complaintId);
    return { success: true, state };
  } catch (error) {
    console.error("Failed to post staff chat message:", error);
    return { success: false, error: "Failed to post staff message" };
  }
}

export async function postAdminChatMessageAction(
  complaintId: string,
  text: string,
  adminName: string
) {
  try {
    const adminMsg: ChatMessage = {
      id: "msg-" + Date.now() + "-admin",
      sender: "admin",
      senderName: adminName || "System Administrator",
      text,
      timestamp: new Date().toISOString(),
    };

    await appendChatMessage(complaintId, adminMsg);

    const state = await getChatState(complaintId);
    return { success: true, state };
  } catch (error) {
    console.error("Failed to post admin chat message:", error);
    return { success: false, error: "Failed to post admin message" };
  }
}

export async function takeoverLiveChatAction(
  complaintId: string,
  staffName: string
) {
  try {
    await setChatMode(complaintId, "staff");

    const systemMsg: ChatMessage = {
      id: "msg-" + Date.now() + "-sys",
      sender: "system",
      senderName: "System",
      text: `Live chat session taken over by ${staffName}.`,
      timestamp: new Date().toISOString(),
    };

    await appendChatMessage(complaintId, systemMsg);

    const state = await getChatState(complaintId);
    return { success: true, state };
  } catch (error) {
    console.error("Failed to take over live chat:", error);
    return { success: false, error: "Failed to take over live chat" };
  }
}
