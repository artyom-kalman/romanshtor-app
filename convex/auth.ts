import Resend from "@auth/core/providers/resend";
import { ConvexCredentials } from "@convex-dev/auth/providers/ConvexCredentials";
import { convexAuth, retrieveAccount } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    ConvexCredentials({
      id: "credentials",
      authorize: async (credentials, ctx) => {
        const { username, password } = credentials as {
          username: string;
          password: string;
        };
        const { user } = await retrieveAccount(ctx, {
          provider: "credentials",
          account: { id: username, secret: password },
        });
        return { userId: user._id };
      },
    }),
    Resend({ from: "noreply@rimskiestory.ru" }),
  ],
  callbacks: {
    async createOrUpdateUser(ctx, args) {
      if (args.existingUserId) return args.existingUserId;

      if (args.type === "credentials") {
        return await ctx.db.insert("users", {
          name: args.profile.name as string,
          email: args.profile.email,
          role: (args.profile.role as string) || "user",
        });
      }

      if (args.type === "email" && args.profile.email) {
        const email = args.profile.email;
        const existingUser = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("email"), email))
          .first();
        if (existingUser) return existingUser._id;
      }

      throw new Error("Пользователь не зарегистрирован");
    },
  },
});
