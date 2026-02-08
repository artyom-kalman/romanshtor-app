import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const schema = defineSchema({
  ...authTables,
  clients: defineTable({
    createdBy: v.id("users"),
    firstName: v.string(),
    lastName: v.string(),
    patronymic: v.optional(v.string()),
    phone: v.string(),
    email: v.optional(v.string()),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  }),
  clientAddresses: defineTable({
    clientId: v.id("clients"),
    address: v.string(),
    createdAt: v.number(),
  }).index("by_client", ["clientId"]),
});

export default schema;
