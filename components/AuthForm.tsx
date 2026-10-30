"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ApiError } from "@/lib/api";
import { useAuth } from "./AuthProvider";
import { ErrorBox, Field, inputClass, primaryBtn } from "./ui";

export const AFTER_LOGIN_KEY = "futsal_after_login";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const { login, signup } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const isLogin = mode === "login";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    setMessage("");
    try {
      if (isLogin) await login(email, password);
      else await signup(email, nickname, password);
      let next = "/";
      try {
        next = sessionStorage.getItem(AFTER_LOGIN_KEY) || "/";
        sessionStorage.removeItem(AFTER_LOGIN_KEY);
      } catch {}
      router.push(next);
    } catch (err) {
      const apiErr = err as ApiError;
      setErrors(apiErr.errors ?? {});
      setMessage(apiErr.message);
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-sm space-y-4">
      <h1 className="text-2xl font-bold">{isLogin ? "로그인" : "회원가입"}</h1>
      <form onSubmit={submit} noValidate className="space-y-4">
        {message && <ErrorBox>{message}</ErrorBox>}
        <Field label="이메일" error={errors.email}>
          <input type="email" autoComplete="email" className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
        </Field>
        {!isLogin && (
          <Field label="닉네임" error={errors.nickname} hint="다른 사람에게 보이는 이름이에요. (2~20자)">
            <input className={inputClass} value={nickname} onChange={(e) => setNickname(e.target.value)} />
          </Field>
        )}
        <Field label="비밀번호" error={errors.password} hint={isLogin ? undefined : "8자 이상으로 적어 주세요."}>
          <input type="password" autoComplete={isLogin ? "current-password" : "new-password"} className={inputClass} value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <button type="submit" disabled={busy} className={primaryBtn + " w-full"}>
          {busy ? "잠시만요..." : isLogin ? "로그인" : "가입하기"}
        </button>
      </form>
      <p className="text-center text-sm text-slate-600">
        {isLogin ? (
          <>계정이 없나요? <Link href="/signup" className="font-semibold text-emerald-700 underline">회원가입</Link></>
        ) : (
          <>이미 계정이 있나요? <Link href="/login" className="font-semibold text-emerald-700 underline">로그인</Link></>
        )}
      </p>
      {isLogin && (
        <div className="rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-600">
          <p className="mb-1 font-semibold">확인용 계정 (가상)</p>
          <ul className="space-y-0.5">
            <li>관리자: admin@futsal.test / admin1234</li>
            <li>일반: user1@futsal.test / user1234 (user2, user3도 같은 비밀번호)</li>
          </ul>
        </div>
      )}
    </div>
  );
}
