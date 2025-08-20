import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/sign_in" },
  secret:
    process.env.NEXTAUTH_SECRET ||
    (process.env.NODE_ENV === "development"
      ? "dev-secret-change-me"
      : undefined),
});

export const config = {
  matcher: ["/chat/:path*", "/prompts/:path*"],
};
