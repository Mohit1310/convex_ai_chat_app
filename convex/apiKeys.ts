import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getUserApiKeys = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const keys = await ctx.db
      .query("apiKeys")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Return keys without the actual encrypted values for security
    return keys.map((key) => ({
      _id: key._id,
      provider: key.provider,
      keyName: key.keyName,
      isActive: key.isActive,
      createdAt: key.createdAt,
    }));
  },
});


export const saveApiKey = mutation({
  args: {
    provider: v.string(),
    keyName: v.string(),
    encryptedKey: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Deactivate other keys for the same provider
    const existingKeys = await ctx.db
      .query("apiKeys")
      .withIndex("by_user_provider", (q) => 
        q.eq("userId", userId).eq("provider", args.provider)
      )
      .collect();

    for (const key of existingKeys) {
      await ctx.db.patch(key._id, { isActive: false });
    }

    // Save new key as active
    return await ctx.db.insert("apiKeys", {
      userId,
      provider: args.provider,
      keyName: args.keyName,
      encryptedKey: args.encryptedKey,
      isActive: true,
      createdAt: Date.now(),
    });
  },
});

export const deleteApiKey = mutation({
  args: { keyId: v.id("apiKeys") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const key = await ctx.db.get(args.keyId);
    if (!key || key.userId !== userId) {
      throw new Error("API key not found");
    }

    await ctx.db.delete(args.keyId);
  },
});

export const getActiveApiKeyData = query({
  args: { provider: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const key = await ctx.db
      .query("apiKeys")
      .withIndex("by_user_provider", (q) => 
        q.eq("userId", userId).eq("provider", args.provider)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (!key) {
      return null;
    }

    return {
      keyName: key.keyName,
      encryptedKey: key.encryptedKey,
    };
  },
});
