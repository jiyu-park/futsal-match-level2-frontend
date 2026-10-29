"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, ApiError, Stadium } from "@/lib/api";
import { ErrorBox, primaryBtn, subBtn } from "@/components/ui";

export default function StadiumsPage() {
  const [stadiums, setStadiums] = useState<Stadium[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Stadium[]>("/stadiums").then(setStadiums).catch((e: ApiError) => setError(e.message));
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">경기장</h1>
        <Link href="/stadiums/new" className={primaryBtn}>경기장 등록</Link>
      </div>
      {error && <ErrorBox>{error}</ErrorBox>}
      {!stadiums && !error && <p className="text-slate-500">불러오는 중...</p>}
      <ul className="space-y-3">
        {stadiums?.map((s) => (
          <li key={s.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4">
            <div>
              <h2 className="font-semibold">{s.name}</h2>
              <p className="text-sm text-slate-600">{s.district} · {s.address}</p>
              <p className="text-xs text-slate-500">모집글 {s.post_count ?? 0}개</p>
            </div>
            <div className="flex shrink-0 gap-2">
              <a href={s.map_url} target="_blank" rel="noreferrer" className={subBtn}>지도</a>
              <Link href={`/stadiums/${s.id}/edit`} className={subBtn}>관리</Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
