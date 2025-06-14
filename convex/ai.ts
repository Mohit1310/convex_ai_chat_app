"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

const GOOGLE_AI_MODELS = [
  { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash", provider: "google" },
  { id: "gemini-1.5-pro", name: "Gemini 1.5 Pro", provider: "google" },
  { id: "gemini-2.0-flash-exp", name: "Gemini 2.0 Flash (Experimental)", provider: "google" },
];

export const getAvailableModels = action({
  args: {},
  handler: async () => {
    return GOOGLE_AI_MODELS;
  },
});

export const sendMessage = action({
  args: {
    chatId: v.id("chats"),
    message: v.string(),
    model: v.string(),
    apiKey: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<string> => {
    // Add user message
    await ctx.runMutation(api.chats.addMessage, {
      chatId: args.chatId,
      role: "user",
      content: args.message,
    });

    try {
      // Get chat history
      const messages = await ctx.runQuery(api.chats.getChatMessages, {
        chatId: args.chatId,
      });

      // Prepare messages for API
      const apiMessages = messages.map((msg: any) => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      }));

      // Use provided API key or fallback to built-in
      const apiKey = args.apiKey || process.env.CONVEX_GOOGLE_AI_API_KEY;
      
      if (!apiKey) {
        throw new Error("No API key available. Please add your Google AI API key in settings.");
      }

      // Call Google AI API
      const response: Response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${args.model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: apiMessages,
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 8192,
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`API Error: ${error}`);
      }

      const data: any = await response.json();
      const aiResponse: string = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!aiResponse) {
        throw new Error("No response from AI model");
      }

      // Add AI response
      await ctx.runMutation(api.chats.addMessage, {
        chatId: args.chatId,
        role: "assistant",
        content: aiResponse,
      });

      return aiResponse;
    } catch (error) {
      // Add error message
      const errorMessage = error instanceof Error ? error.message : "An error occurred";
      await ctx.runMutation(api.chats.addMessage, {
        chatId: args.chatId,
        role: "assistant",
        content: `Sorry, I encountered an error: ${errorMessage}`,
      });
      
      throw error;
    }
  },
});
