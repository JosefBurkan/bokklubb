import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const requestedNext = requestUrl.searchParams.get("next") ?? "/";

  // Only allow relative paths to prevent external redirects.
  const next = requestedNext.startsWith("/") &&
    !requestedNext.startsWith("//")
    ? requestedNext
    : "/";

  if (!code) {
    return NextResponse.redirect(
      new URL("/?authError=missing_code", requestUrl.origin),
    );
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Discord callback failed:", error.message);

    return NextResponse.redirect(
      new URL("/?authError=discord_login_failed", requestUrl.origin),
    );
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
