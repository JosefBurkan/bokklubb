import LogoutButton from "@/app/components/LogoutButton";

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-[var(--main)] px-6 py-10 text-gray-900">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold">
          Adminpanel
        </h1>

        <p className="mt-2 text-gray-600">
          Du er logget inn som admin.
        </p>

        <LogoutButton />
      </div>
    </main>
  );
}