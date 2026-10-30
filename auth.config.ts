import type { NextAuthConfig } from "next-auth";

/** Config "leve" sem providers — usada pelo proxy.ts, que corre isolado e não
 * pode carregar o driver nativo do Postgres (@/lib/db/prisma → pg). O
 * provider Credentials, que precisa da base de dados, só existe em auth.ts. */
export const authConfig: NextAuthConfig = {
  pages: { signIn: "/login" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isPublic = request.nextUrl.pathname === "/login";

      if (!auth && !isPublic) return false;
      if (auth && isPublic) {
        return Response.redirect(new URL("/", request.nextUrl.origin));
      }
      return true;
    },
  },
};
