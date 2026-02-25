import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import { getAuthUserId, createAccount } from "@convex-dev/auth/server";
import { api } from "./_generated/api";

export const hasUsers = query({
  handler: async (ctx) => {
    const firstUser = await ctx.db.query("users").first();
    return firstUser !== null;
  },
});

export const currentUser = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }

    const account = await ctx.db
      .query("authAccounts")
      .withIndex("userIdAndProvider", (q) =>
        q.eq("userId", userId).eq("provider", "credentials"),
      )
      .first();

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      username: account?.providerAccountId,
    };
  },
});

export const list = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db.get(userId);
    if (user?.role !== "admin") {
      throw new Error("Только для администраторов");
    }

    const users = await ctx.db.query("users").collect();

    const usersWithAccounts = await Promise.all(
      users.map(async (u) => {
        const account = await ctx.db
          .query("authAccounts")
          .withIndex("userIdAndProvider", (q) =>
            q.eq("userId", u._id).eq("provider", "credentials"),
          )
          .first();
        return {
          _id: u._id,
          name: u.name,
          email: u.email,
          role: u.role,
          username: account?.providerAccountId,
        };
      }),
    );

    return usersWithAccounts;
  },
});

export const seed = action({
  args: {
    username: v.string(),
    password: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const hasExisting = await ctx.runQuery(api.users.hasUsers);
    if (hasExisting) {
      throw new Error("Администратор уже создан");
    }

    await createAccount(ctx, {
      provider: "credentials",
      account: { id: args.username, secret: args.password },
      profile: { name: args.name, role: "admin" },
    });
  },
});

export const createUser = action({
  args: {
    username: v.string(),
    password: v.string(),
    name: v.string(),
    role: v.string(),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await ctx.runQuery(api.users.currentUser);
    if (currentUser?.role !== "admin") {
      throw new Error("Только для администраторов");
    }

    await createAccount(ctx, {
      provider: "credentials",
      account: { id: args.username, secret: args.password },
      profile: {
        name: args.name,
        role: args.role,
        email: args.email,
      },
      shouldLinkViaEmail: !!args.email,
    });
  },
});

export const deleteUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }

    const currentUser = await ctx.db.get(currentUserId);
    if (currentUser?.role !== "admin") {
      throw new Error("Только для администраторов");
    }

    if (args.userId === currentUserId) {
      throw new Error("Нельзя удалить самого себя");
    }

    const sessions = await ctx.db
      .query("authSessions")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .collect();
    for (const session of sessions) {
      const tokens = await ctx.db
        .query("authRefreshTokens")
        .withIndex("sessionId", (q) => q.eq("sessionId", session._id))
        .collect();
      for (const token of tokens) {
        await ctx.db.delete(token._id);
      }
      await ctx.db.delete(session._id);
    }

    const accounts = await ctx.db
      .query("authAccounts")
      .withIndex("userIdAndProvider", (q) => q.eq("userId", args.userId))
      .collect();
    for (const account of accounts) {
      await ctx.db.delete(account._id);
    }

    await ctx.db.delete(args.userId);
  },
});
