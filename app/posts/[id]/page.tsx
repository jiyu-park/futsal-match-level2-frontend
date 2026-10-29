"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { api, ApiError, Application, formatDate, formatFee, Post, postStatus } from "@/lib/api";
import { dangerBtn, ErrorBox, Field, inputClass, primaryBtn, subBtn } from "@/components/ui";

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [error, setError] = useState("");

  const [deleting, setDeleting] = useState(false);
  const [password, setPassword] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const [form, setForm] = useState({ applicant_name: "", applicant_contact: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [applyMessage, setApplyMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [applying, setApplying] = useState(false);

  const [cancelId, setCancelId] = useState<number | null>(null);
  const [cancelPw, setCancelPw] = useState("");
  const [cancelMessage, setCancelMessage] = useState("");

  const load = useCallback(async () => {
    try {
      const [p, apps] = await Promise.all([
        api<Post>(`/posts/${id}`),
        api<Application[]>(`/posts/${id}/applications`),
      ]);
      setPost(p);
      setApplications(apps);
    } catch (e) {
      setError((e as ApiError).message);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function apply(e: React.FormEvent) {
    e.preventDefault();
    setApplying(true);
    setErrors({});
    setApplyMessage(null);
    try {
      await api(`/posts/${id}/applications`, { method: "POST", body: form });
      setForm({ applicant_name: "", applicant_contact: "", password: "" });
      setApplyMessage({ ok: true, text: "신청이 완료되었어요! 취소할 때 쓸 비밀번호를 꼭 기억해 두세요." });
    } catch (err) {
      const apiErr = err as ApiError;
      setErrors(apiErr.errors ?? {});
      setApplyMessage({ ok: false, text: apiErr.message });
    }
    setApplying(false);
    load();
  }

  async function cancel(applicationId: number) {
    setCancelMessage("");
    try {
      await api(`/applications/${applicationId}`, { method: "DELETE", body: { password: cancelPw } });
      setCancelId(null);
      setCancelPw("");
      setApplyMessage({ ok: true, text: "신청을 취소했어요." });
      load();
    } catch (e) {
      const err = e as ApiError;
      setCancelMessage(err.errors.password ?? err.message);
    }
  }

  async function remove() {
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
  const canApply = !post.is_ended && post.remaining > 0;
  const setF = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const rows: [string, string][] = [
    ["경기장", `${post.stadium_district} · ${post.stadium_name}`],
    ["주소", post.stadium_address],
    ["날짜·시간", `${formatDate(post.play_date)} ${post.play_time}`],
    ["실력 수준", post.skill_level],
    ["참가비", formatFee(post.fee)],
    ["작성자", post.author_name],
    ["작성자 연락", post.contact],
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
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">참가 신청</h2>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold">
            신청 {post.applied_count} / {post.capacity}명 · {st.label}
          </span>
        </div>

        {applyMessage && (applyMessage.ok
          ? <div role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">{applyMessage.text}</div>
          : <ErrorBox>{applyMessage.text}</ErrorBox>)}

        {canApply ? (
          <form onSubmit={apply} noValidate className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="이름" error={errors.applicant_name}>
                <input className={inputClass} value={form.applicant_name} onChange={setF("applicant_name")} />
              </Field>
              <Field label="연락 방법" error={errors.applicant_contact}>
                <input className={inputClass} value={form.applicant_contact} onChange={setF("applicant_contact")} placeholder="예: 오픈채팅 아이디" />
              </Field>
              <Field label="취소용 비밀번호 (4자리)" error={errors.password}>
                <input type="password" inputMode="numeric" maxLength={4} className={inputClass} value={form.password} onChange={setF("password")} />
              </Field>
            </div>
            <button type="submit" disabled={applying} className={primaryBtn}>{applying ? "신청하는 중..." : "신청하기"}</button>
          </form>
        ) : (
          <p className="rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-600">
            {post.is_ended ? "경기가 이미 시작되었거나 끝나서 신청할 수 없어요." : "정원이 다 찼어요. 다른 모집글을 찾아보세요."}
          </p>
        )}

        <div>
          <h3 className="mb-2 text-sm font-semibold">신청한 사람 ({applications.length})</h3>
          {applications.length === 0 && <p className="text-sm text-slate-500">아직 신청한 사람이 없어요.</p>}
          <ul className="divide-y divide-slate-100 text-sm">
            {applications.map((a) => (
              <li key={a.id} className="py-2">
                <div className="flex items-center justify-between gap-2">
                  <span>{a.applicant_name}</span>
                  {cancelId !== a.id && (
                    <button className="text-slate-500 underline" onClick={() => { setCancelId(a.id); setCancelPw(""); setCancelMessage(""); }}>
                      신청 취소
                    </button>
                  )}
                </div>
                {cancelId === a.id && (
                  <div className="mt-2 space-y-1">
                    <div className="flex gap-2">
                      <input type="password" inputMode="numeric" maxLength={4} placeholder="비밀번호 4자리" value={cancelPw} onChange={(e) => setCancelPw(e.target.value)} className={inputClass + " w-40"} />
                      <button className={dangerBtn} onClick={() => cancel(a.id)}>취소하기</button>
                      <button className={subBtn} onClick={() => setCancelId(null)}>닫기</button>
                    </div>
                    {cancelMessage && <p className="text-sm font-medium text-red-600">{cancelMessage}</p>}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="flex flex-wrap items-start gap-2">
        <Link href={`/posts/${post.id}/edit`} className={subBtn}>글 수정</Link>
        {!deleting ? (
          <button className={dangerBtn} onClick={() => setDeleting(true)}>글 삭제</button>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input type="password" inputMode="numeric" maxLength={4} placeholder="글 비밀번호 4자리" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass + " w-44"} />
              <button className={dangerBtn} onClick={remove}>삭제하기</button>
              <button className={subBtn} onClick={() => { setDeleting(false); setPassword(""); setDeleteError(""); }}>취소</button>
            </div>
            {deleteError && <p className="text-sm font-medium text-red-600">{deleteError}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
