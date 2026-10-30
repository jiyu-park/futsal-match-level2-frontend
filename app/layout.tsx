import type { Metadata } from "next";
import AuthProvider from "@/components/AuthProvider";
import NavBar from "@/components/NavBar";
import "./globals.css";

export const metadata: Metadata = {
  title: "서울 풋살 매칭",
  description: "서울 풋살장별 모집글을 보고 바로 참가 신청해요.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ko" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <AuthProvider>
          <header className="border-b border-slate-200 bg-white">
            <NavBar />
          </header>
          <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">{children}</main>
        </AuthProvider>
        <footer className="py-6 text-center text-xs text-slate-500">
          모집글·작성자·연락처는 모두 가상 데이터입니다.
        </footer>
      </body>
    </html>
  );
}
