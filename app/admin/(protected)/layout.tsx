import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/supabase/server";

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Check whether there is a valid authenticated session.
  const { data, error } = await supabase.auth.getClaims();

  // Reject anyone who is not authenticated as the admin.
  if (
    error ||
    !data?.claims ||
    data.claims.sub !== process.env.ADMIN_USER_ID
  ) {
    redirect("/admin/login");
  }

  return <>{children}</>;
}