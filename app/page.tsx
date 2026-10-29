"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, ApiError, formatDate, formatFee, Post, postStatus, SKILL_LEVELS, Stadium } from "@/lib/api";
import { ErrorBox, inputClass, primaryBtn } from "@/components/ui";

const TONE = {
  open: "bg-emerald-100 text-emerald-800",
  full: "bg-amber-100 text-amber-800",
  ended: "bg-slate-200 text-slate-600",
};

export default function HomePage() {
  const [posts, setPosts] = useState<Post[] | null>(null);
  const [districts, setDistricts] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [district, setDistrict] = useState("");
  const [skill, setSkill] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    api<Stadium[]>("/stadiums")
      .then((list) => setDistricts([...new Set(list.map((s) => s.district))].sort()))
      .catch(() => {});
  }, []);

  // 검색어나 필터가 바뀔 때마다 서버에 다시 물어본다 (검색어는 잠깐 기다렸다가)
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (district) params.set("district", district);
      if (skill) params.set("skill_level", skill);
      if (status) params.set("status", status);
      api<Post[]>(`/posts?${params.toString()}`)
        .then((list) => {
          setPosts(list);
          setError("");
        })
        .catch((e: ApiError) => setError(e.message));
    }, 250);
    return () => clearTimeout(timer);
  }, [q, district, skill, status]);

  const filtered = Boolean(q || district || skill || status);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">풋살 모집글</h1>
        <Link href="/posts/new" className={primaryBtn}>글 올리기</Link>
      </div>

      <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3">
        <input
          className={inputClass}
          placeholder="🔍 제목, 경기장, 주소, 작성자로 검색"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="grid grid-cols-3 gap-2">
          <select className={inputClass} value={district} onChange={(e) => setDistrict(e.target.value)} aria-label="구">
            <option value="">구 전체</option>
            {districts.map((d) => <option key={d}>{d}</option>)}
          </select>
          <select className={inputClass} value={skill} onChange={(e) => setSkill(e.target.value)} aria-label="실력 수준">
            <option value="">실력 전체</option>
            {SKILL_LEVELS.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value)} aria-label="상태">
            <option value="">상태 전체</option>
            <option value="open">신청 가능</option>
            <option value="full">정원 마감</option>
            <option value="ended">경기 종료</option>
          </select>
        </div>
        {filtered && (
          <button className="text-sm text-slate-500 underline" onClick={() => { setQ(""); setDistrict(""); setSkill(""); setStatus(""); }}>
            조건 모두 지우기
          </button>
        )}
      </div>

      {error && <ErrorBox>{error}</ErrorBox>}
      {!posts && !error && <p className="text-slate-500">불러오는 중...</p>}
      {posts && posts.length === 0 && (
        <p className="rounded-lg bg-white p-6 text-center text-slate-500">
          {filtered ? "조건에 맞는 글이 없어요. 조건을 바꿔 보세요." : "아직 올라온 글이 없어요. 첫 글을 올려 보세요!"}
        </p>
      )}

      <ul className="space-y-3">
        {posts?.map((p) => {
          const st = postStatus(p);
          return (
            <li key={p.id}>
              <Link href={`/posts/${p.id}`} className="block rounded-xl border border-slate-200 bg-white p-4 hover:border-emerald-500">
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-semibold">{p.title}</h2>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${TONE[st.tone]}`}>{st.label}</span>
                </div>
                <p className="mt-1 text-sm text-slate-600">📍 {p.stadium_district} · {p.stadium_name}</p>
                <p className="mt-1 text-sm text-slate-600">
                  🗓 {formatDate(p.play_date)} {p.play_time} · 💰 {formatFee(p.fee)} · {p.skill_level}
                </p>
                <p className="mt-1 text-sm font-medium text-slate-800">👥 신청 {p.applied_count} / {p.capacity}명</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
