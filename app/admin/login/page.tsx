
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/supabase/server";
import LoginForm from "./LoginForm";

export default async function AdminLoginPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!error && user) {
    if (user.id === process.env.ADMIN_USER_ID) {
      redirect("/admin");
    }

    redirect("/");
  }

  return <LoginForm />;
}
