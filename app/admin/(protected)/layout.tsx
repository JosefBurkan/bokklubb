import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { createClient } from "@/supabase/server";
import AdminNavigation from "./AdminNavigation";

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

  return (
    <div className="flex min-h-full flex-1 flex-col bg-[#E7DCE8]">
      <AdminNavigation />
      <div className="flex flex-1 flex-col">{children}</div>
    </div>
  );
}
