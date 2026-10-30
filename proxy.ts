import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Next.js 16 renomeou "middleware" para "proxy" — mesma função, ficheiro
// diferente. Usa só o auth.config.ts (sem providers) porque o proxy corre
// isolado e não consegue carregar o driver nativo do Postgres (pg) que
// auth.ts arrasta via @/lib/db/prisma. Protege todas as rotas menos /login
// e as do próprio Auth.js (api/auth/*, já excluídas pelo matcher abaixo).
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|manifest.webmanifest|icon-.*\\.png).*)"],
};
