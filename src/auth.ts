import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import MicrosoftEntraID from "next-auth/providers/microsoft-entra-id";
import { verifiedEmailFrom } from "@/lib/sponsorAccess";

/**
 * Sign-in for the private sponsor portal. No database: the session is a signed, encrypted cookie.
 * Each provider turns on only when its keys are set in the host's environment variables
 * (see docs/sponsor-portal.md), so the site keeps working before setup is finished.
 */
const env = process.env;
const hasGoogle = Boolean(env.AUTH_GOOGLE_ID && env.AUTH_GOOGLE_SECRET);
const hasMicrosoft = Boolean(env.AUTH_MICROSOFT_ENTRA_ID_ID && env.AUTH_MICROSOFT_ENTRA_ID_SECRET);

export const SIGN_IN_OPTIONS = [
  ...(hasGoogle ? [{ id: "google", label: "Continue with Google" }] : []),
  ...(hasMicrosoft ? [{ id: "microsoft-entra-id", label: "Continue with Microsoft" }] : []),
] as const;

/** True once there's a session secret and at least one provider, i.e. sign-in can actually work. */
export const authConfigured = Boolean(env.AUTH_SECRET) && SIGN_IN_OPTIONS.length > 0;

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    ...(hasGoogle ? [Google({ authorization: { params: { prompt: "select_account" } } })] : []),
    ...(hasMicrosoft
      ? [
          MicrosoftEntraID({
            // Basic sign-in only (no Microsoft Graph access), which fewer company IT policies block.
            authorization: { params: { scope: "openid profile email", prompt: "select_account" } },
            profile: (profile) => ({ id: profile.sub, name: profile.name, email: profile.email, image: null }),
          }),
        ]
      : []),
  ],
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  pages: { signIn: "/sponsor-portal", error: "/sponsor-portal" },
  callbacks: {
    jwt({ token, account, profile }) {
      // Only on the sign-in itself: remember whether the provider vouched for the email address.
      if (account) token.verifiedEmail = verifiedEmailFrom(account.provider, profile as Record<string, unknown> | undefined);
      return token;
    },
    session({ session, token }) {
      session.verifiedEmail = typeof token.verifiedEmail === "string" ? token.verifiedEmail : null;
      return session;
    },
  },
});

declare module "next-auth" {
  interface Session {
    /** The signed-in email, only if Google or Microsoft confirmed the person owns it. */
    verifiedEmail: string | null;
  }
}
