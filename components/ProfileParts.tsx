import type { Profile } from "@/lib/api";

const stars = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);

export function StatCards({ profile }: { profile: Profile }) {
  const s = profile.stats;
  const cards: [string, string][] = [
    ["참가한 경기", `${s.attended_count}회`],
    ["출석률", s.attendance_rate === null ? "기록 없음" : `${s.attendance_rate}%`],
    ["노쇼", `${s.no_show_count}회`],
    ["매너 점수", s.manner_average === null ? "후기 없음" : `${s.manner_average} / 5`],
    ["받은 후기", `${s.review_count}개`],
    ["모집한 경기", `${s.hosted_count}회`],
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {cards.map(([label, value]) => (
        <div key={label} className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="text-xs text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-bold text-emerald-700">{value}</p>
        </div>
      ))}
    </div>
  );
}

export function RecentReviews({ profile }: { profile: Profile }) {
  return (
    <section className="space-y-2">
      <h2 className="text-lg font-bold">받은 후기</h2>
      {profile.recent_reviews.length === 0 && <p className="text-sm text-slate-500">아직 받은 후기가 없어요.</p>}
      <ul className="space-y-2 text-sm">
        {profile.recent_reviews.map((r, i) => (
          <li key={i} className="rounded-lg border border-slate-200 bg-white p-3">
            <p><span className="text-amber-600">{stars(r.rating)}</span> <span className="text-slate-500">· {r.reviewer_nickname} · {r.post_title}</span></p>
            {r.comment && <p className="mt-1">{r.comment}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}

