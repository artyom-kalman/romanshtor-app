import { convexTest } from "convex-test";
import { describe, expect, it } from "bun:test";
import schema from "./schema";
import { api } from "./_generated/api";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const modules: Record<string, () => Promise<any>> = {
  "./auth.config.ts": () => import("./auth.config"),
  "./auth.ts": () => import("./auth"),
  "./http.ts": () => import("./http"),
  "./users.ts": () => import("./users"),
  "./_generated/api.js": () => import("./_generated/api"),
  "./_generated/server.js": () => import("./_generated/server"),
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function seedAdmin(t: any) {
  const userId = await t.run(async (ctx: any) => {
    return await ctx.db.insert("users", { role: "admin" });
  });
  const accountId = await t.run(async (ctx: any) => {
    return await ctx.db.insert("authAccounts", {
      userId,
      provider: "credentials",
      providerAccountId: "admin",
    });
  });
  const sessionId = await t.run(async (ctx: any) => {
    return await ctx.db.insert("authSessions", {
      userId,
      expirationTime: Date.now() + 1000 * 60 * 60,
    });
  });
  const asAdmin = t.withIdentity({ subject: `${userId}|${sessionId}` });
  return { userId, accountId, sessionId, asAdmin };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function seedUser(t: any, username: string, role = "user") {
  const userId = await t.run(async (ctx: any) => {
    return await ctx.db.insert("users", { role });
  });
  const accountId = await t.run(async (ctx: any) => {
    return await ctx.db.insert("authAccounts", {
      userId,
      provider: "credentials",
      providerAccountId: username,
    });
  });
  const sessionId = await t.run(async (ctx: any) => {
    return await ctx.db.insert("authSessions", {
      userId,
      expirationTime: Date.now() + 1000 * 60 * 60,
    });
  });
  const asUser = t.withIdentity({ subject: `${userId}|${sessionId}` });
  return { userId, accountId, sessionId, asUser };
}

describe("hasUsers", () => {
  it("returns false on empty DB", async () => {
    const t = convexTest(schema, modules);
    expect(await t.query(api.users.hasUsers)).toBe(false);
  });

  it("returns true when a user exists", async () => {
    const t = convexTest(schema, modules);
    await t.run(async (ctx) => {
      await ctx.db.insert("users", { role: "admin" });
    });
    expect(await t.query(api.users.hasUsers)).toBe(true);
  });
});

describe("currentUser", () => {
  it("returns null when unauthenticated", async () => {
    const t = convexTest(schema, modules);
    expect(await t.query(api.users.currentUser)).toBeNull();
  });

  it("returns user data when authenticated", async () => {
    const t = convexTest(schema, modules);
    const { userId, asAdmin } = await seedAdmin(t);
    const result = await asAdmin.query(api.users.currentUser);
    expect(result).toEqual({
      _id: userId,
      role: "admin",
      username: "admin",
    });
  });
});

describe("list", () => {
  it("throws when unauthenticated", async () => {
    const t = convexTest(schema, modules);
    await expect(t.query(api.users.list)).rejects.toThrow("Not authenticated");
  });

  it("throws when caller is not admin", async () => {
    const t = convexTest(schema, modules);
    const { asUser } = await seedUser(t, "worker", "user");
    await expect(asUser.query(api.users.list)).rejects.toThrow(
      "Только для администраторов",
    );
  });

  it("returns all users with usernames", async () => {
    const t = convexTest(schema, modules);
    const { asAdmin, userId: adminId } = await seedAdmin(t);
    const { userId: userId2 } = await seedUser(t, "worker", "user");
    const result = await asAdmin.query(api.users.list);
    expect(result).toHaveLength(2);
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ _id: adminId, role: "admin", username: "admin" }),
        expect.objectContaining({ _id: userId2, role: "user", username: "worker" }),
      ]),
    );
  });
});

describe("deleteUser", () => {
  it("throws when unauthenticated", async () => {
    const t = convexTest(schema, modules);
    const { userId } = await seedUser(t, "target", "user");
    await expect(
      t.mutation(api.users.deleteUser, { userId }),
    ).rejects.toThrow("Not authenticated");
  });

  it("throws when caller is not admin", async () => {
    const t = convexTest(schema, modules);
    const { asUser } = await seedUser(t, "worker", "user");
    const { userId: targetId } = await seedUser(t, "target", "user");
    await expect(
      asUser.mutation(api.users.deleteUser, { userId: targetId }),
    ).rejects.toThrow("Только для администраторов");
  });

  it("throws when trying to delete self", async () => {
    const t = convexTest(schema, modules);
    const { userId, asAdmin } = await seedAdmin(t);
    await expect(
      asAdmin.mutation(api.users.deleteUser, { userId }),
    ).rejects.toThrow("Нельзя удалить самого себя");
  });

  it("cascading deletion: removes user, accounts, sessions, refresh tokens", async () => {
    const t = convexTest(schema, modules);
    const { asAdmin } = await seedAdmin(t);
    const { userId: targetId, sessionId: targetSessionId } = await seedUser(
      t,
      "target",
      "user",
    );

    // Add a refresh token for the target user's session
    await t.run(async (ctx) => {
      await ctx.db.insert("authRefreshTokens", {
        sessionId: targetSessionId,
        expirationTime: Date.now() + 1000 * 60 * 60,
      });
    });

    await asAdmin.mutation(api.users.deleteUser, { userId: targetId });

    // Verify everything is gone
    const remaining = await t.run(async (ctx) => {
      const user = await ctx.db.get(targetId);
      const accounts = await ctx.db
        .query("authAccounts")
        .withIndex("userIdAndProvider", (q) => q.eq("userId", targetId))
        .collect();
      const sessions = await ctx.db
        .query("authSessions")
        .withIndex("userId", (q) => q.eq("userId", targetId))
        .collect();
      const tokens = await ctx.db
        .query("authRefreshTokens")
        .withIndex("sessionId", (q) => q.eq("sessionId", targetSessionId))
        .collect();
      return { user, accounts, sessions, tokens };
    });

    expect(remaining.user).toBeNull();
    expect(remaining.accounts).toHaveLength(0);
    expect(remaining.sessions).toHaveLength(0);
    expect(remaining.tokens).toHaveLength(0);
  });
});

describe("updateUsername", () => {
  it("throws when unauthenticated", async () => {
    const t = convexTest(schema, modules);
    const { userId } = await seedUser(t, "target", "user");
    await expect(
      t.mutation(api.users.updateUsername, { userId, newUsername: "new" }),
    ).rejects.toThrow("Not authenticated");
  });

  it("throws when caller is not admin", async () => {
    const t = convexTest(schema, modules);
    const { asUser, userId } = await seedUser(t, "worker", "user");
    await expect(
      asUser.mutation(api.users.updateUsername, { userId, newUsername: "new" }),
    ).rejects.toThrow("Только для администраторов");
  });

  it("rejects duplicate username", async () => {
    const t = convexTest(schema, modules);
    const { asAdmin } = await seedAdmin(t);
    const { userId } = await seedUser(t, "worker", "user");
    await expect(
      asAdmin.mutation(api.users.updateUsername, { userId, newUsername: "admin" }),
    ).rejects.toThrow("Пользователь с таким именем уже существует");
  });

  it("successfully renames user", async () => {
    const t = convexTest(schema, modules);
    const { asAdmin } = await seedAdmin(t);
    const { userId } = await seedUser(t, "oldname", "user");

    await asAdmin.mutation(api.users.updateUsername, {
      userId,
      newUsername: "newname",
    });

    const account = await t.run(async (ctx) => {
      return await ctx.db
        .query("authAccounts")
        .withIndex("userIdAndProvider", (q) =>
          q.eq("userId", userId).eq("provider", "credentials"),
        )
        .first();
    });
    expect(account?.providerAccountId).toBe("newname");
  });
});

describe("getAccountByUserId", () => {
  it("throws when unauthenticated", async () => {
    const t = convexTest(schema, modules);
    const { userId } = await seedUser(t, "target", "user");
    await expect(
      t.query(api.users.getAccountByUserId, { userId }),
    ).rejects.toThrow("Not authenticated");
  });

  it("throws when caller is not admin", async () => {
    const t = convexTest(schema, modules);
    const { asUser, userId } = await seedUser(t, "worker", "user");
    await expect(
      asUser.query(api.users.getAccountByUserId, { userId }),
    ).rejects.toThrow("Только для администраторов");
  });

  it("returns null for user without account", async () => {
    const t = convexTest(schema, modules);
    const { asAdmin } = await seedAdmin(t);
    // Create a user without an authAccounts entry
    const noAccountUserId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", { role: "user" });
    });
    const result = await asAdmin.query(api.users.getAccountByUserId, {
      userId: noAccountUserId,
    });
    expect(result).toBeNull();
  });

  it("returns account data for valid user", async () => {
    const t = convexTest(schema, modules);
    const { asAdmin } = await seedAdmin(t);
    const { userId } = await seedUser(t, "worker", "user");
    const result = await asAdmin.query(api.users.getAccountByUserId, { userId });
    expect(result).toEqual({ providerAccountId: "worker" });
  });
});
