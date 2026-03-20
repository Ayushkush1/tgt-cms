import type { NextAuthConfig } from "next-auth";


export default {
  providers: [],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // On initial sign-in, copy user fields into token
      if (user) {
        token.id = user.id;
        token.name = user.name;
      }
      // When update() is called from the client, merge the new data into token
      if (trigger === "update" && session?.name) {
        token.name = session.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        if (token.id) session.user.id = token.id as string;
        // Always read name from the token so updates are reflected immediately
        if (token.name) session.user.name = token.name as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
