import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/supabase/server";
import LoginForm from "./LoginForm";

export default async function AdminLoginPage() {
  
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.auth.getClaims();

  if (
    !error &&
    data?.claims &&
    data.claims.sub === process.env.ADMIN_USER_ID
  ) {
    redirect("/admin");
  }

  return <LoginForm />;
}