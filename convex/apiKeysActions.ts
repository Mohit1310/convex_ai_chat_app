"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

export const saveApiKeyAction = action({
  args: {
    provider: v.string(),
    keyName: v.string(),
    apiKey: v.string(),
  },
  handler: async (ctx, args): Promise<any> => {
    // Simple encryption (in production, use proper encryption)
    const encryptedKey = Buffer.from(args.apiKey).toString('base64');

    return await ctx.runMutation(api.apiKeys.saveApiKey, {
      provider: args.provider,
      keyName: args.keyName,
      encryptedKey,
    });
  },
});

export const getActiveApiKey = action({
  args: { provider: v.string() },
  handler: async (ctx, args): Promise<{ keyName: string; apiKey: string } | null> => {
    const keyData = await ctx.runQuery(api.apiKeys.getActiveApiKeyData, {
      provider: args.provider,
    });

    if (!keyData) {
      return null;
    }

    // Decrypt the key (simple base64 decoding)
    const decryptedKey = Buffer.from(keyData.encryptedKey, 'base64').toString();
    
    return {
      keyName: keyData.keyName,
      apiKey: decryptedKey,
    };
  },
});
