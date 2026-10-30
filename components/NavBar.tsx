"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthProvider";

export default function NavBar() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  return (
    <nav className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2 px-4 py-3">
      <Link href="/" className="text-lg font-bold text-emerald-700">⚽ 서울 풋살 매칭</Link>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium">
        <Link href="/" className="hover:text-emerald-700">모집글</Link>
        <Link href="/stadiums" className="hover:text-emerald-700">경기장</Link>
        <Link href="/stats" className="hover:text-emerald-700">현황</Link>
        {!loading && (user ? (
          <>
            <Link href="/me" className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-800 hover:bg-emerald-100">
              {user.nickname}{user.role === "admin" ? " · 관리자" : ""}
            </Link>
            <button className="text-slate-500 hover:underline" onClick={() => { logout(); router.push("/"); }}>로그아웃</button>
          </>
        ) : (
          <>
            <Link href="/login" className="hover:text-emerald-700">로그인</Link>
            <Link href="/signup" className="rounded-lg bg-emerald-600 px-3 py-1 text-white hover:bg-emerald-700">가입</Link>
          </>
        ))}
      </div>
    </nav>
  );
}
