"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import LoginLink from "@/components/LoginLink";
import { ErrorBox, primaryBtn } from "@/components/ui";
import { api, ApiError, ATTENDANCE_LABEL, formatDate, HistoryItem, Profile } from "@/lib/api";
import { RecentReviews, StatCards } from "@/components/ProfileParts";

function Row({ item, right }: { item: HistoryItem; right?: React.ReactNode }) {
  return (
    <li className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white p-3 text-sm">
      <Link href={`/posts/${item.post_id}`} className="min-w-0 hover:underline">
        <p className="truncate font-medium">{item.title}</p>
        <p className="text-xs text-slate-500">{formatDate(item.play_date)} {item.play_time} · {item.stadium_name}</p>
      </Link>
      {right}
    </li>
  );
}

export default function MyPage() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [history, setHistory] = useState<{ applied: HistoryItem[]; hosted: HistoryItem[] } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    Promise.all([api<Profile>(`/users/${user.id}`), api<{ applied: HistoryItem[]; hosted: HistoryItem[] }>("/me/history")])
      .then(([p, h]) => {
        setProfile(p);
        setHistory(h);
      })
      .catch((e: ApiError) => setError(e.message));
  }, [user]);

  if (loading) return <p className="text-slate-500">불러오는 중...</p>;
  if (!user) {
    return (
      <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
        <p>내 기록을 보려면 로그인이 필요해요.</p>
        <LoginLink className={primaryBtn}>로그인하러 가기</LoginLink>
      </div>
    );
  }
  if (error) return <ErrorBox>{error}</ErrorBox>;
  if (!profile || !history) return <p className="text-slate-500">불러오는 중...</p>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{profile.nickname}님의 기록</h1>
        <p className="text-sm text-slate-500">{user.email}{user.role === "admin" ? " · 관리자" : ""} (이메일은 나만 볼 수 있어요)</p>
      </div>
      <StatCards profile={profile} />

      <section className="space-y-2">
        <h2 className="text-lg font-bold">내가 신청한 경기 ({history.applied.length})</h2>
        {history.applied.length === 0 && <p className="text-sm text-slate-500">아직 신청한 경기가 없어요.</p>}
        <ul className="space-y-2">
          {history.applied.map((a) => (
            <Row key={a.application_id} item={a} right={
              <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${a.attendance === "attended" ? "bg-emerald-100 text-emerald-800" : a.attendance === "no_show" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"}`}>
                {a.is_ended ? ATTENDANCE_LABEL[a.attendance ?? "pending"] : "신청 완료"}
              </span>
            } />
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-bold">내가 모집한 경기 ({history.hosted.length})</h2>
        {history.hosted.length === 0 && <p className="text-sm text-slate-500">아직 모집한 경기가 없어요.</p>}
        <ul className="space-y-2">
          {history.hosted.map((h) => (
            <Row key={h.post_id} item={h} right={<span className="shrink-0 text-xs text-slate-500">신청 {h.applied_count}명 · {h.is_ended ? "종료" : "모집 중"}</span>} />
          ))}
        </ul>
      </section>

      <RecentReviews profile={profile} />
    </div>
  );
}
