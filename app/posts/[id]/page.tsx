"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import LoginLink from "@/components/LoginLink";
import { dangerBtn, ErrorBox, inputClass, primaryBtn, subBtn } from "@/components/ui";
import {
  api, ApiError, Application, ATTENDANCE_LABEL, formatDate, formatFee, Participant, Post, postStatus, Review,
} from "@/lib/api";

const stars = (n: number) => "★".repeat(n) + "☆".repeat(5 - n);

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [post, setPost] = useState<Post | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const [deleting, setDeleting] = useState(false);
  const [password, setPassword] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const [legacyCancelId, setLegacyCancelId] = useState<number | null>(null);
  const [legacyPw, setLegacyPw] = useState("");

  const [draft, setDraft] = useState<Record<number, { rating: string; comment: string }>>({});
  const [reviewErrors, setReviewErrors] = useState<Record<number, string>>({});

  const load = useCallback(async () => {
    try {
      const [p, apps, parts, revs] = await Promise.all([
        api<Post>(`/posts/${id}`),
        api<Application[]>(`/posts/${id}/applications`),
        api<Participant[]>(`/posts/${id}/participants`),
        api<Review[]>(`/posts/${id}/reviews`),
      ]);
      setPost(p);
      setApplications(apps);
      setParticipants(parts);
      setReviews(revs);
    } catch (e) {
      setError((e as ApiError).message);
    }
  }, [id]);

  useEffect(() => {
    // 화면을 열 때 서버에서 글·신청·후기를 불러온다 (setState는 응답이 온 뒤에 일어난다)
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function run(action: () => Promise<unknown>, success: string) {
    setBusy(true);
    setNotice(null);
    try {
      await action();
      setNotice({ ok: true, text: success });
    } catch (e) {
      setNotice({ ok: false, text: (e as ApiError).message });
    }
    setBusy(false);
    load();
  }

  const apply = () => run(() => api(`/posts/${id}/applications`, { method: "POST" }), "신청이 완료되었어요!");
  const cancel = (appId: number, body?: object) =>
    run(() => api(`/applications/${appId}`, { method: "DELETE", body: body ?? {} }), "신청을 취소했어요.");
  const mark = (appId: number, status: string) =>
    run(() => api(`/applications/${appId}/attendance`, { method: "PATCH", body: { status } }), "참석 여부를 저장했어요.");

  async function sendReview(targetId: number) {
    const d = draft[targetId] ?? { rating: "", comment: "" };
    setReviewErrors((r) => ({ ...r, [targetId]: "" }));
    try {
      await api(`/posts/${id}/reviews`, { method: "POST", body: { target_id: targetId, rating: d.rating, comment: d.comment } });
      setNotice({ ok: true, text: "후기를 남겼어요. 고마워요!" });
      load();
    } catch (e) {
      const err = e as ApiError;
      setReviewErrors((r) => ({ ...r, [targetId]: err.errors.rating ?? err.errors.comment ?? err.message }));
    }
  }

  async function removePost() {
    setDeleteError("");
    try {
      await api(`/posts/${id}`, { method: "DELETE", body: { password } });
      router.push("/");
    } catch (e) {
      const err = e as ApiError;
      setDeleteError(err.errors.password ?? err.message);
    }
  }

  if (error) return <ErrorBox>{error}</ErrorBox>;
  if (!post) return <p className="text-slate-500">불러오는 중...</p>;

  const st = postStatus(post);
  const isAdmin = user?.role === "admin";
  const isOwner = Boolean(user && post.owner_id === user.id);
  const legacyPost = post.owner_id === null;
  const canManage = isOwner || isAdmin || legacyPost;
  const myApplication = user ? applications.find((a) => a.user_id === user.id) : undefined;
  const iAmParticipant = user ? participants.some((p) => p.user_id === user.id) : false;
  const reviewedByMe = new Set(reviews.filter((r) => r.reviewer_id === user?.id).map((r) => r.target_id));
  const reviewTargets = participants.filter((p) => p.user_id !== user?.id && !reviewedByMe.has(p.user_id));

  const rows: [string, React.ReactNode][] = [
    ["경기장", `${post.stadium_district} · ${post.stadium_name}`],
    ["주소", post.stadium_address],
    ["날짜·시간", `${formatDate(post.play_date)} ${post.play_time}`],
    ["실력 수준", post.skill_level],
    ["참가비", formatFee(post.fee)],
    ["작성자", post.owner_id ? <Link href={`/users/${post.owner_id}`} className="font-semibold text-emerald-700 underline">{post.owner_nickname}</Link> : post.author_name],
    ["작성자 연락", user ? post.contact : "로그인하면 볼 수 있어요"],
  ];

  return (
    <div className="space-y-4">
      <Link href="/" className="text-sm text-slate-500 hover:underline">← 목록으로</Link>

      <article className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
        <h1 className="text-xl font-bold">{post.title}</h1>
        <dl className="grid grid-cols-[6rem_1fr] gap-y-2 text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="contents"><dt className="text-slate-500">{k}</dt><dd>{v}</dd></div>
          ))}
        </dl>
        <a href={post.stadium_map_url} target="_blank" rel="noreferrer" className={subBtn}>🗺 지도에서 보기</a>
        {post.description && (
          <div>
            <h2 className="mb-1 text-sm font-semibold">설명</h2>
            <p className="whitespace-pre-wrap text-sm">{post.description}</p>
          </div>
        )}
      </article>

      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-bold">참가 신청</h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold">
            신청 {post.applied_count} / {post.capacity}명 · {st.label}
          </span>
        </div>

        {notice && (notice.ok
          ? <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">{notice.text}</div>
          : <ErrorBox>{notice.text}</ErrorBox>)}

        {post.is_ended ? (
          <p className="rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-600">경기가 이미 시작되었거나 끝나서 신청할 수 없어요.</p>
        ) : myApplication ? (
          <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-800">✅ 이 경기에 신청했어요. 아래 명단에서 취소할 수 있어요.</p>
        ) : post.remaining <= 0 ? (
          <p className="rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-600">정원이 다 찼어요. 다른 모집글을 찾아보세요.</p>
        ) : user ? (
          <button className={primaryBtn} disabled={busy} onClick={apply}>{busy ? "신청하는 중..." : "신청하기"}</button>
        ) : (
          <LoginLink className={primaryBtn}>로그인하고 신청하기</LoginLink>
        )}

        <div>
          <h3 className="mb-2 text-sm font-semibold">신청한 사람 ({applications.length})</h3>
          {applications.length === 0 && <p className="text-sm text-slate-500">아직 신청한 사람이 없어요.</p>}
          <ul className="divide-y divide-slate-100 text-sm">
            {applications.map((a) => {
              const mine = Boolean(user && a.user_id === user.id);
              const canCancel = !post.is_ended && (mine || isAdmin || a.user_id === null);
              return (
                <li key={a.id} className="py-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span>
                      {a.user_id ? <Link href={`/users/${a.user_id}`} className="font-medium text-emerald-700 underline">{a.applicant_name}</Link> : a.applicant_name}
                      {mine && <span className="ml-1 text-xs text-slate-500">(나)</span>}
                      {(post.is_ended || a.attendance !== "pending") && (
                        <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${a.attendance === "attended" ? "bg-emerald-100 text-emerald-800" : a.attendance === "no_show" ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"}`}>
                          {ATTENDANCE_LABEL[a.attendance]}
                        </span>
                      )}
                    </span>
                    <span className="flex flex-wrap items-center gap-2">
                      {post.is_ended && (isOwner || isAdmin) && (
                        <>
                          <button className="rounded border border-emerald-300 px-2 py-0.5 text-xs text-emerald-800 hover:bg-emerald-50" disabled={busy} onClick={() => mark(a.id, "attended")}>참석</button>
                          <button className="rounded border border-red-300 px-2 py-0.5 text-xs text-red-700 hover:bg-red-50" disabled={busy} onClick={() => mark(a.id, "no_show")}>불참</button>
                        </>
                      )}
                      {canCancel && (a.user_id === null && !isAdmin ? (
                        <button className="text-slate-500 underline" onClick={() => { setLegacyCancelId(a.id); setLegacyPw(""); }}>신청 취소</button>
                      ) : (
                        <button className="text-slate-500 underline" disabled={busy} onClick={() => cancel(a.id)}>{mine ? "내 신청 취소" : "신청 취소"}</button>
                      ))}
                    </span>
                  </div>
                  {legacyCancelId === a.id && (
                    <div className="mt-2 flex gap-2">
                      <input type="password" inputMode="numeric" maxLength={4} placeholder="비밀번호 4자리" value={legacyPw} onChange={(e) => setLegacyPw(e.target.value)} className={inputClass + " w-40"} />
                      <button className={dangerBtn} onClick={() => { cancel(a.id, { password: legacyPw }); setLegacyCancelId(null); }}>취소하기</button>
                      <button className={subBtn} onClick={() => setLegacyCancelId(null)}>닫기</button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          {post.is_ended && (isOwner || isAdmin) && (
            <p className="mt-2 text-xs text-slate-500">경기가 끝났어요. 신청한 사람이 왔는지 &quot;참석&quot; 또는 &quot;불참&quot;으로 표시해 주세요. 기록에 쌓여요.</p>
          )}
        </div>
      </section>

      {post.is_ended && (
        <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-lg font-bold">매너 후기</h2>
          {reviews.length === 0 && <p className="text-sm text-slate-500">아직 남긴 후기가 없어요.</p>}
          <ul className="space-y-2 text-sm">
            {reviews.map((r) => (
              <li key={r.id} className="rounded-lg bg-slate-50 p-3">
                <p>
                  <Link href={`/users/${r.reviewer_id}`} className="font-medium underline">{r.reviewer_nickname}</Link> → <Link href={`/users/${r.target_id}`} className="font-medium underline">{r.target_nickname}</Link>
                  <span className="ml-2 text-amber-600">{stars(r.rating)}</span>
                </p>
                {r.comment && <p className="mt-1 text-slate-700">{r.comment}</p>}
              </li>
            ))}
          </ul>

          {!user ? (
            <p className="text-sm text-slate-600"><LoginLink className="font-semibold text-emerald-700 underline">로그인</LoginLink>하면 함께 뛴 사람에게 후기를 남길 수 있어요.</p>
          ) : !iAmParticipant ? (
            <p className="rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-600">이 경기에 함께 뛴 사람만 후기를 남길 수 있어요.</p>
          ) : reviewTargets.length === 0 ? (
            <p className="text-sm text-slate-500">남길 수 있는 후기를 모두 남겼어요. 👍</p>
          ) : (
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">함께 뛴 사람에게 후기 남기기</h3>
              {reviewTargets.map((t) => {
                const d = draft[t.user_id] ?? { rating: "", comment: "" };
                const setD = (patch: Partial<typeof d>) => setDraft((x) => ({ ...x, [t.user_id]: { ...d, ...patch } }));
                return (
                  <div key={t.user_id} className="space-y-2 rounded-lg border border-slate-200 p-3">
                    <p className="text-sm font-medium">{t.nickname}{t.role === "host" ? " (모집한 사람)" : ""}</p>
                    <div className="flex flex-wrap gap-2">
                      <select className={inputClass + " w-40"} value={d.rating} onChange={(e) => setD({ rating: e.target.value })} aria-label="매너 점수">
                        <option value="">매너 점수</option>
                        {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{stars(n)} ({n}점)</option>)}
                      </select>
                      <input className={inputClass + " flex-1"} placeholder="한마디 (선택, 200자 이내)" value={d.comment} onChange={(e) => setD({ comment: e.target.value })} />
                      <button className={primaryBtn} onClick={() => sendReview(t.user_id)}>남기기</button>
                    </div>
                    {reviewErrors[t.user_id] && <p className="text-sm font-medium text-red-600">{reviewErrors[t.user_id]}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {canManage && (
        <div className="flex flex-wrap items-start gap-2">
          <Link href={`/posts/${post.id}/edit`} className={subBtn}>글 수정</Link>
          {!deleting ? (
            <button className={dangerBtn} onClick={() => setDeleting(true)}>글 삭제</button>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                {legacyPost && !isAdmin && (
                  <input type="password" inputMode="numeric" maxLength={4} placeholder="글 비밀번호 4자리" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass + " w-44"} />
                )}
                <button className={dangerBtn} onClick={removePost}>삭제하기</button>
                <button className={subBtn} onClick={() => { setDeleting(false); setPassword(""); setDeleteError(""); }}>취소</button>
              </div>
              {deleteError && <p className="text-sm font-medium text-red-600">{deleteError}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
