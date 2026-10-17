"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/v1/auth/session", { credentials: "include" });
        if (!res.ok) throw new Error("no session");
        const env = await res.json();
        if (!env?.data?.user) throw new Error("no session");
      } catch {
        if (!cancelled) router.replace("/admin/login?next=/dashboard");
      } finally {
        if (!cancelled) setChecked(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!checked) {
    return (
      <div className="min-h-screen bg-sand-900 flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-sand-300 font-mono">Verifying Command Center session...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
