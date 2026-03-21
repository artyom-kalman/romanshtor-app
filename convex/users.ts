import { v } from "convex/values";
import { query, mutation, action } from "./_generated/server";
import {
  getAuthUserId,
  createAccount,
  modifyAccountCredentials,
} from "@convex-dev/auth/server";
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
  },
  handler: async (ctx, args) => {
    const hasExisting = await ctx.runQuery(api.users.hasUsers);
    if (hasExisting) {
      throw new Error("Администратор уже создан");
    }

    await createAccount(ctx, {
      provider: "credentials",
      account: { id: args.username, secret: args.password },
      profile: { role: "admin" },
    });
  },
});

export const createUser = action({
  args: {
    username: v.string(),
    password: v.string(),
    role: v.string(),
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
        role: args.role,
      },
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

export const updatePassword = action({
  args: {
    userId: v.id("users"),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await ctx.runQuery(api.users.currentUser);
    if (currentUser?.role !== "admin") {
      throw new Error("Только для администраторов");
    }

    const account = await ctx.runQuery(api.users.getAccountByUserId, {
      userId: args.userId,
    });
    if (!account) {
      throw new Error("Аккаунт не найден");
    }

    await modifyAccountCredentials(ctx, {
      provider: "credentials",
      account: { id: account.providerAccountId, secret: args.newPassword },
    });
  },
});

export const getAccountByUserId = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    const user = await ctx.db.get(userId);
    if (user?.role !== "admin") {
      throw new Error("Только для администраторов");
    }

    const account = await ctx.db
      .query("authAccounts")
      .withIndex("userIdAndProvider", (q) =>
        q.eq("userId", args.userId).eq("provider", "credentials"),
      )
      .first();

    if (!account) {
      return null;
    }
    return { providerAccountId: account.providerAccountId };
  },
});

export const updateUsername = mutation({
  args: {
    userId: v.id("users"),
    newUsername: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) {
      throw new Error("Not authenticated");
    }
    const currentUser = await ctx.db.get(currentUserId);
    if (currentUser?.role !== "admin") {
      throw new Error("Только для администраторов");
    }

    const existing = await ctx.db
      .query("authAccounts")
      .withIndex("providerAndAccountId", (q) =>
        q
          .eq("provider", "credentials")
          .eq("providerAccountId", args.newUsername),
      )
      .first();
    if (existing) {
      throw new Error("Пользователь с таким именем уже существует");
    }

    const account = await ctx.db
      .query("authAccounts")
      .withIndex("userIdAndProvider", (q) =>
        q.eq("userId", args.userId).eq("provider", "credentials"),
      )
      .first();
    if (!account) {
      throw new Error("Аккаунт не найден");
    }

    await ctx.db.patch(account._id, {
      providerAccountId: args.newUsername,
    });
  },
});
