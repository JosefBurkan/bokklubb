"use client";

import {
  FormEvent,
  useState,
} from "react";

import { createClient } from "@/supabase/client";

export default function LoginForm() {
  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);


  // =========================
  // LOGIN
  // =========================

  async function handleLogin(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");
    setLoading(true);

    const supabase =
      createClient();

    try {
      /*
       * Ask Supabase Auth to verify
       * the entered email and password.
       */
      const { error } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });


      /*
       * Authentication failed.
       */
      if (error) {
        setMessage(
          "Feil e-post eller passord."
        );

        return;
      }


      /*
       * Login succeeded.
       *
       * A full navigation ensures that
       * the server receives the new
       * authentication session when
       * loading the protected admin area.
       */
      window.location.href =
        "/admin";
    } catch {
      setMessage(
        "Noe gikk galt. Prøv igjen."
      );
    } finally {
      setLoading(false);
    }
  }


  return (
    <main className="flex min-h-[calc(100vh-72px)] flex-1 items-center justify-center bg-main px-6 py-12">

      <div className="w-full max-w-md">

        {/* =========================
            LOGIN CARD
        ========================= */}

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">

          {/* Card header */}
          <div className="border-b border-gray-200 px-7 py-7">

            <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-700">

              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect
                  width="18"
                  height="11"
                  x="3"
                  y="11"
                  rx="2"
                  ry="2"
                />

                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>

            </div>


            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
              Administrasjon
            </p>

            <h1 className="text-2xl font-bold text-gray-900">
              Logg inn
            </h1>

            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              Logg inn for å administrere
              produkter og underkategorier.
            </p>

          </div>


          {/* =========================
              FORM
          ========================= */}

          <form
            onSubmit={handleLogin}
            className="space-y-5 px-7 py-7"
          >

            {/* Email */}
            <div>

              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                E-post
              </label>

              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(
                    event.target.value
                  )
                }
                required
                autoComplete="email"
                placeholder="navn@eksempel.no"
                disabled={loading}
                className="
                  h-12
                  w-full
                  rounded-xl
                  border
                  border-gray-300
                  bg-white
                  px-4
                  text-gray-900
                  caret-gray-900
                  outline-none
                  transition
                  placeholder:text-gray-400

                  hover:border-gray-400

                  focus:border-orange-500
                  focus:ring-2
                  focus:ring-orange-500/20

                  disabled:cursor-not-allowed
                  disabled:bg-gray-100
                "
              />

            </div>


            {/* Password */}
            <div>

              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Passord
              </label>


              <div className="relative">

                <input
                  id="password"
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  required
                  autoComplete="current-password"
                  placeholder="Skriv inn passord"
                  disabled={loading}
                  className="
                    h-12
                    w-full
                    rounded-xl
                    border
                    border-gray-300
                    bg-white
                    px-4
                    pr-12
                    text-gray-900
                    caret-gray-900
                    outline-none
                    transition
                    placeholder:text-gray-400

                    hover:border-gray-400

                    focus:border-orange-500
                    focus:ring-2
                    focus:ring-orange-500/20

                    disabled:cursor-not-allowed
                    disabled:bg-gray-100
                  "
                />


                {/* Show / hide password */}
                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (previous) =>
                        !previous
                    )
                  }
                  disabled={loading}
                  aria-label={
                    showPassword
                      ? "Skjul passord"
                      : "Vis passord"
                  }
                  className="
                    absolute
                    right-3
                    top-1/2
                    flex
                    h-8
                    w-8
                    -translate-y-1/2
                    cursor-pointer
                    items-center
                    justify-center
                    rounded-lg
                    text-gray-400
                    transition

                    hover:bg-gray-100
                    hover:text-gray-700
                  "
                >

                  {showPassword ? (
                    /* Eye off */
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="19"
                      height="19"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m2 2 20 20" />
                      <path d="M6.71 6.71C4.94 7.93 3.6 9.73 3 12c1.73 5.06 5.64 8 9 8 1.37 0 2.84-.49 4.17-1.36" />
                      <path d="M10.73 5.08A7 7 0 0 1 12 5c3.36 0 7.27 2.94 9 7a11.5 11.5 0 0 1-1.19 2.37" />
                      <path d="M14.12 14.12A3 3 0 0 1 9.88 9.88" />
                    </svg>
                  ) : (
                    /* Eye */
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="19"
                      height="19"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2.06 12.35a1 1 0 0 1 0-.7C3.78 7.6 7.55 5 12 5c4.45 0 8.22 2.6 9.94 6.65a1 1 0 0 1 0 .7C20.22 16.4 16.45 19 12 19c-4.45 0-8.22-2.6-9.94-6.65" />

                      <circle
                        cx="12"
                        cy="12"
                        r="3"
                      />
                    </svg>
                  )}

                </button>

              </div>

            </div>


            {/* =========================
                ERROR
            ========================= */}

            {message && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3"
              >
                <p className="text-sm font-medium text-red-700">
                  {message}
                </p>
              </div>
            )}


            {/* =========================
                LOGIN BUTTON
            ========================= */}

            <button
              type="submit"
              disabled={loading}
              className="
                flex
                h-12
                w-full
                cursor-pointer
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-primary
                px-5
                font-semibold
                text-white
                shadow-sm
                transition

                hover:bg-primary-dark
                hover:shadow-md

                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >

              {loading && (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              )}

              {loading
                ? "Logger inn..."
                : "Logg inn"}

            </button>

          </form>


          {/* =========================
              FOOTER
          ========================= */}

          <div className="border-t border-gray-200 bg-gray-50 px-7 py-4">

            <div className="flex items-center gap-2 text-xs text-gray-500">

              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3z" />
              </svg>

              <span>
                Kun for autoriserte administratorer
              </span>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}