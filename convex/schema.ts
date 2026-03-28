import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

const { users: _users, ...otherAuthTables } = authTables;

const schema = defineSchema({
  ...otherAuthTables,
  users: defineTable({
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    image: v.optional(v.string()),
    isAnonymous: v.optional(v.boolean()),
    role: v.optional(v.string()),
  })
    .index("phone", ["phone"]),
  documents: defineTable({
    type: v.string(),
    title: v.string(),
    number: v.string(),
    fields: v.record(v.string(), v.string()),
    orderId: v.optional(v.string()),
    createdBy: v.id("users"),
    updatedAt: v.number(),
    isArchived: v.boolean(),
  })
    .index("by_type", ["type"])
    .index("by_type_isArchived", ["type", "isArchived"])
    .index("by_createdBy", ["createdBy"])
    .index("by_orderId", ["orderId"]),
});

export default schema;
