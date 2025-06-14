'use node';

import { v } from 'convex/values';
import { action } from './_generated/server';
import { api } from './_generated/api';

const GOOGLE_AI_MODELS = [
  {
    id: 'gemini-2.5-flash-preview-05-20',
    name: 'Gemini 2.5 Flash',
    provider: 'google',
  },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'google' },
  {
    id: 'gemini-2.0-flash-lite',
    name: 'Gemini 2.0 Flash Lite',
    provider: 'google',
  },
  {
    id: 'gemini-2.0-flash-preview-image-generation',
    name: 'Gemini 2.0 Flash Image generation',
    provider: 'google',
  },
];

export const getAvailableModels = action({
  args: {},
  handler: async () => {
    return GOOGLE_AI_MODELS;
  },
});

export const generateImage = action({
  args: {
    chatId: v.id('chats'),
    prompt: v.string(),
    model: v.string(),
    apiKey: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<string> => {
    // Add user message
    await ctx.runMutation(api.chats.addMessage, {
      chatId: args.chatId,
      role: 'user',
      content: args.prompt,
      contentType: 'text',
    });
    try {
      const apiKey = args.apiKey || process.env.CONVEX_GOOGLE_AI_API_KEY;

      if (!apiKey) {
        throw new Error(
          'No API key available. Please add your Google AI API key in settings.'
        );
      }

      // Call Google AI API for image generation
      const response: Response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${args.model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [{ text: args.prompt }],
              },
            ],
            generationConfig: {
              responseModalities: ['TEXT', 'IMAGE'],
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`API Error: ${error}`);
      }

      const data: any = await response.json();
      const candidate = data.candidates?.[0];
      if (!candidate) {
        throw new Error('No response from AI model');
      }

      let imageData = null;
      let textResponse = "Here's your generated image";
      // look for image data in response
      for (const part of candidate.content?.parts || []) {
        if (part.inlineData && part.inlineData.data) {
          imageData = part.inlineData.data;
        }
        if (part.text) {
          textResponse = part.text;
        }
      }

      if (!imageData) {
        throw new Error('No image data received from the model');
      }

      // Add AI response with image
      await ctx.runMutation(api.chats.addMessage, {
        chatId: args.chatId,
        role: 'assistant',
        content: textResponse,
        contentType: 'image',
        imageData: imageData,
      });

      return textResponse;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'An error occurred';
      await ctx.runMutation(api.chats.addMessage, {
        chatId: args.chatId,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${errorMessage}`,
        contentType: 'text',
      });

      throw error;
    }
  },
});

export const sendMessage = action({
  args: {
    chatId: v.id('chats'),
    message: v.string(),
    model: v.string(),
    apiKey: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<string> => {
    // Add user message
    await ctx.runMutation(api.chats.addMessage, {
      chatId: args.chatId,
      role: 'user',
      content: args.message,
      contentType: 'text',
    });

    try {
      // Get chat history
      const messages = await ctx.runQuery(api.chats.getChatMessages, {
        chatId: args.chatId,
      });

      // Prepare messages for API
      const apiMessages = messages.map((msg: any) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      // Use provided API key or fallback to built-in
      const apiKey = args.apiKey || process.env.CONVEX_GOOGLE_AI_API_KEY;

      if (!apiKey) {
        throw new Error(
          'No API key available. Please add your Google AI API key in settings.'
        );
      }

      // Call Google AI API
      const response: Response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${args.model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: apiMessages,
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              // maxOutputTokens: 8192,
            },
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`API Error: ${error}`);
      }

      const data: any = await response.json();
      const aiResponse: string =
        data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!aiResponse) {
        throw new Error('No response from AI model');
      }

      // Add AI response
      await ctx.runMutation(api.chats.addMessage, {
        chatId: args.chatId,
        role: 'assistant',
        content: aiResponse,
        contentType: 'text',
      });

      return aiResponse;
    } catch (error) {
      // Add error message
      const errorMessage =
        error instanceof Error ? error.message : 'An error occurred';
      await ctx.runMutation(api.chats.addMessage, {
        chatId: args.chatId,
        role: 'assistant',
        content: `Sorry, I encountered an error: ${errorMessage}`,
      });

      throw error;
    }
  },
});
