import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "서울 풋살 매칭",
  description: "서울 풋살장별 모집글을 보고 바로 참가 신청해요.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <header className="border-b border-slate-200 bg-white">
          <nav className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-lg font-bold text-emerald-700">
              ⚽ 서울 풋살 매칭
            </Link>
            <div className="flex gap-4 text-sm font-medium">
              <Link href="/" className="hover:text-emerald-700">모집글</Link>
              <Link href="/stadiums" className="hover:text-emerald-700">경기장</Link>
              <Link href="/stats" className="hover:text-emerald-700">현황</Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">{children}</main>
        <footer className="py-6 text-center text-xs text-slate-500">
          모집글·작성자·연락처는 모두 가상 데이터입니다.
        </footer>
      </body>
    </html>
  );
}
