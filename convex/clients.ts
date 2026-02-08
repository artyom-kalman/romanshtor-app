import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const list = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const clients = await ctx.db.query("clients").order("desc").collect();

    const clientsWithAddresses = await Promise.all(
      clients.map(async (client) => {
        const addresses = await ctx.db
          .query("clientAddresses")
          .withIndex("by_client", (q) => q.eq("clientId", client._id))
          .collect();
        return { ...client, addresses };
      }),
    );

    return clientsWithAddresses;
  },
});

export const create = mutation({
  args: {
    firstName: v.string(),
    lastName: v.string(),
    patronymic: v.optional(v.string()),
    phone: v.string(),
    email: v.optional(v.string()),
    address: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const { address, ...clientData } = args;

    const clientId = await ctx.db.insert("clients", {
      ...clientData,
      createdBy: userId,
      createdAt: Date.now(),
    });

    if (address) {
      await ctx.db.insert("clientAddresses", {
        clientId,
        address,
        createdAt: Date.now(),
      });
    }

    return clientId;
  },
});
