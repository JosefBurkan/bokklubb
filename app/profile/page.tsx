import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/supabase/server";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) redirect("/login");

  redirect(`/members/${user.id}`);
}
