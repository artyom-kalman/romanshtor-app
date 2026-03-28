import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Documents are shared across all authenticated users by design — no per-user ownership filtering.
export const list = query({
  args: {
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    let q;
    if (args.type) {
      q = ctx.db
        .query("documents")
        .withIndex("by_type", (q) => q.eq("type", args.type!));
    } else {
      q = ctx.db.query("documents");
    }

    const documents = await q
      .filter((q) => q.neq(q.field("isArchived"), true))
      .order("desc")
      .collect();
    return documents.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

export const get = query({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    type: v.string(),
    title: v.string(),
    fields: v.record(v.string(), v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    // Safe from race conditions: Convex OCC retries the entire mutation on read/write conflicts,
    // so concurrent creates will never produce duplicate numbers.
    const existing = await ctx.db
      .query("documents")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .collect();
    const maxNum = existing.reduce(
      (max, d) => Math.max(max, parseInt(d.number, 10) || 0),
      0,
    );
    const number = String(maxNum + 1);

    return await ctx.db.insert("documents", {
      type: args.type,
      title: args.title,
      number,
      fields: args.fields,
      createdBy: userId,
      updatedAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("documents"),
    title: v.optional(v.string()),
    fields: v.optional(v.record(v.string(), v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const doc = await ctx.db.get(args.id);
    if (!doc) {
      throw new Error("Документ не найден");
    }

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.title !== undefined) {
      updates.title = args.title;
    }
    if (args.fields !== undefined) {
      updates.fields = args.fields;
    }

    await ctx.db.patch(args.id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const doc = await ctx.db.get(args.id);
    if (!doc) {
      throw new Error("Документ не найден");
    }

    await ctx.db.patch(args.id, { isArchived: true, updatedAt: Date.now() });
  },
});
