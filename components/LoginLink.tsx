"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AFTER_LOGIN_KEY } from "./AuthForm";

// 로그인한 뒤 지금 보던 페이지로 돌아오게 기억해 둔다
export default function LoginLink({ children, className }: { children: React.ReactNode; className?: string }) {
  const pathname = usePathname();
  return (
    <Link
      href="/login"
      className={className}
      onClick={() => {
        try {
          sessionStorage.setItem(AFTER_LOGIN_KEY, pathname);
        } catch {}
      }}
    >
      {children}
    </Link>
  );
}
