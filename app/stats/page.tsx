"use client";

import { useEffect, useState } from "react";
import { api, ApiError, Stats } from "@/lib/api";
import { dangerBtn, ErrorBox, Field, inputClass } from "@/components/ui";

export default function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");
  const [admin, setAdmin] = useState("");
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () =>
    api<Stats>("/stats").then(setStats).catch((e: ApiError) => setError(e.message));

  useEffect(() => {
    load();
  }, []);

  async function reset() {
    if (!window.confirm("모집글과 신청을 모두 지우고 가상 데이터로 다시 채울까요?")) return;
    setBusy(true);
    setMessage(null);
    try {
      const r = await api<{ posts: number; applications: number }>("/admin/reset-demo", {
        method: "POST",
        adminPassword: admin,
      });
      setMessage({ ok: true, text: `가상 데이터로 다시 채웠어요. (모집글 ${r.posts}개, 신청 ${r.applications}건)` });
      load();
    } catch (e) {
      setMessage({ ok: false, text: (e as ApiError).message });
    }
    setBusy(false);
  }

  const cards: [string, number | undefined, string][] = [
    ["오늘 들어온 신청", stats?.today_applications, "건"],
    ["신청 가능한 모집글", stats?.open_posts, "개"],
    ["남은 자리 (합계)", stats?.remaining_seats, "자리"],
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">현황</h1>
      {error && <ErrorBox>{error}</ErrorBox>}
      <div className="grid gap-3 sm:grid-cols-3">
        {cards.map(([label, value, unit]) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-1 text-4xl font-bold text-emerald-700">
              {value ?? "–"}<span className="ml-1 text-base font-medium text-slate-500">{unit}</span>
            </p>
          </div>
        ))}
      </div>

      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
        <h2 className="font-bold">가상 데이터 다시 채우기</h2>
        <p className="text-sm text-slate-600">모집글과 신청을 모두 지우고 처음 상태의 가상 데이터로 되돌려요. 경기장은 그대로 둡니다.</p>
        {message && (message.ok
          ? <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">{message.text}</div>
          : <ErrorBox>{message.text}</ErrorBox>)}
        <Field label="관리자 비밀번호">
          <input type="password" className={inputClass} value={admin} onChange={(e) => setAdmin(e.target.value)} />
        </Field>
        <button className={dangerBtn} disabled={busy} onClick={reset}>{busy ? "채우는 중..." : "가상 데이터 다시 채우기"}</button>
      </section>
    </div>
  );
}
