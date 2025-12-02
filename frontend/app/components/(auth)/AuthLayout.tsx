"use client";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div
      className="flex min-h-[calc(100dvh-80px)] w-full items-center justify-center p-4"
      style={{ background: "linear-gradient(180deg, #1B293A 0%, #131517 75%)" }}
    >
      <div className="w-full max-w-lg lg:bg-white/5 lg:rounded-3xl p-8 md:bg-transparent lg:border lg:border-white/10 shadow-2xl">
        {children}
      </div>
    </div>
  );
}