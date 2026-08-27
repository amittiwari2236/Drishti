import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = { title: "Sign in - Pragya Yog School" };

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row bg-white">
      {/* ── Left: Reference Banner Panel ── */}
      <div className="relative w-full md:w-1/2 min-h-[420px] md:min-h-screen bg-black flex items-center justify-center overflow-hidden">
        <Image
          src="/pragya-banner.png"
          alt="Pragya Yog School - Where Science Meets Spirituality"
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover object-center"
        />
      </div>

      {/* ── Right: Clean Form Panel ── */}
      <div className="flex w-full md:w-1/2 flex-col items-center justify-center px-6 py-12 sm:px-12 md:px-16 lg:px-24 bg-white">
        <div className="w-full max-w-[460px]">
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
