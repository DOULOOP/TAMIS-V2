"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store user info and token in localStorage or cookies
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("token", data.token);

        // Redirect to dashboard
        router.push("/dashboard");
      } else {
        setError(data.message || "Giriş işlemi başarısız oldu");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="mb-6 text-center text-2xl font-semibold text-gray-900">
          Sistem Girişi
        </h2>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          E-posta Adresi
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          placeholder="ornek@tamis.gov.tr"
          disabled={isLoading}
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Şifre
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
          placeholder="••••••••"
          disabled={isLoading}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            name="remember-me"
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label
            htmlFor="remember-me"
            className="ml-2 block text-sm text-gray-700"
          >
            Beni hatırla
          </label>
        </div>

        <div className="text-sm">
          <a
            href="#"
            className="font-medium text-blue-600 transition-colors hover:text-blue-500"
          >
            Şifremi unuttum
          </a>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-3 text-sm font-medium text-white shadow-sm transition-colors hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? (
          <div className="flex items-center">
            <svg
              className="mr-3 -ml-1 h-5 w-5 animate-spin text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Giriş yapılıyor...
          </div>
        ) : (
          "Giriş Yap"
        )}
      </button>

      <div className="mt-6 rounded-lg border border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 text-center shadow-sm">
        <div className="mb-2 flex items-center justify-center">
          <svg
            className="mr-2 h-4 w-4 text-blue-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm font-medium text-blue-700">Demo Hesabı</span>
        </div>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-700">Demo Bilgileri</span>
            </div>
            <button
              type="button"
              onClick={() => {
          setEmail("admin@tamis.gov.tr");
          setPassword("admin123");
              }}
              className="inline-flex items-center gap-2 rounded-md border border-blue-200 bg-white px-3 py-1.5 text-xs font-medium text-blue-600 shadow-sm transition-colors hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Formu demo bilgilerle doldur"
            >
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor" className="text-blue-600">
          <path d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293A1 1 0 103.293 10.707l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z" />
              </svg>
              Formu doldur
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <span className="w-20 shrink-0 font-medium text-gray-800">Email</span>
              <div className="flex flex-1 items-center justify-between gap-2">
          <code className="w-full rounded-md border border-blue-200 bg-white px-2 py-1 font-mono text-xs text-blue-700 shadow-sm sm:w-auto">
            admin@tamis.gov.tr
          </code>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText("admin@tamis.gov.tr")}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs text-gray-700 shadow-sm transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="E-postayı kopyala"
            aria-label="E-postayı kopyala"
          >
            <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" className="text-gray-600">
              <path d="M6 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V7.414A2 2 0 0013.414 6L10 2.586A2 2 0 008.586 2H6z" />
              <path d="M8 2v4a2 2 0 002 2h4" />
            </svg>
            Kopyala
          </button>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
              <span className="w-20 shrink-0 font-medium text-gray-800">Şifre</span>
              <div className="flex flex-1 items-center justify-between gap-2">
          <code className="w-full rounded-md border border-blue-200 bg-white px-2 py-1 font-mono text-xs text-blue-700 shadow-sm sm:w-auto">
            admin123
          </code>
          <button
            type="button"
            onClick={() => navigator.clipboard.writeText("admin123")}
            className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs text-gray-700 shadow-sm transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="Şifreyi kopyala"
            aria-label="Şifreyi kopyala"
          >
            <svg width="12" height="12" viewBox="0 0 20 20" fill="currentColor" className="text-gray-600">
              <path d="M6 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V7.414A2 2 0 0013.414 6L10 2.586A2 2 0 008.586 2H6z" />
              <path d="M8 2v4a2 2 0 002 2h4" />
            </svg>
            Kopyala
          </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
