"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError, Post, SKILL_LEVELS, SPORTS, Stadium } from "@/lib/api";
import { ErrorBox, Field, inputClass, primaryBtn, subBtn } from "./ui";

type Values = {
  stadium_id: string;
  sport: string;
  title: string;
  play_date: string;
  play_time: string;
  capacity: string;
  author_name: string;
  contact: string;
  skill_level: string;
  fee: string;
  description: string;
  password: string;
};

const EMPTY: Values = {
  stadium_id: "",
  sport: "풋살",
  title: "",
  play_date: "",
  play_time: "",
  capacity: "",
  author_name: "",
  contact: "",
  skill_level: "",
  fee: "",
  description: "",
  password: "",
};

export default function PostForm({ post }: { post?: Post }) {
  const router = useRouter();
  const editing = Boolean(post);
  const [stadiums, setStadiums] = useState<Stadium[]>([]);
  const [values, setValues] = useState<Values>(
    post
      ? {
          stadium_id: String(post.stadium_id),
          sport: post.sport,
          title: post.title,
          play_date: post.play_date,
          play_time: post.play_time,
          capacity: String(post.capacity),
          author_name: post.author_name,
          contact: post.contact,
          skill_level: post.skill_level,
          fee: String(post.fee),
          description: post.description ?? "",
          password: "",
        }
      : EMPTY,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api<Stadium[]>("/stadiums").then(setStadiums).catch((e: ApiError) => setMessage(e.message));
  }, []);

  const set = (key: keyof Values) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrors({});
    setMessage("");
    try {
      const saved = await api<Post>(editing ? `/posts/${post!.id}` : "/posts", {
        method: editing ? "PATCH" : "POST",
        body: values,
      });
      router.push(`/posts/${saved.id}`);
    } catch (err) {
      const apiErr = err as ApiError;
      setErrors(apiErr.errors ?? {});
      setMessage(apiErr.message);
      setSaving(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {message && <ErrorBox>{message}</ErrorBox>}

      <Field label="경기장" error={errors.stadium_id}>
        <select className={inputClass} value={values.stadium_id} onChange={set("stadium_id")}>
          <option value="">경기장을 골라 주세요</option>
          {stadiums.map((s) => (
            <option key={s.id} value={s.id}>
              {s.district} · {s.name}
            </option>
          ))}
        </select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="종목" error={errors.sport}>
          <select className={inputClass} value={values.sport} onChange={set("sport")}>
            {SPORTS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
        <Field label="실력 수준" error={errors.skill_level}>
          <select className={inputClass} value={values.skill_level} onChange={set("skill_level")}>
            <option value="">골라 주세요</option>
            {SKILL_LEVELS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="제목" error={errors.title}>
        <input className={inputClass} value={values.title} onChange={set("title")} placeholder="예: 토요일 아침 풋살 6명 모집" />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="경기 날짜" error={errors.play_date}>
          <input type="date" className={inputClass} value={values.play_date} onChange={set("play_date")} />
        </Field>
        <Field label="시작 시간" error={errors.play_time}>
          <input type="time" className={inputClass} value={values.play_time} onChange={set("play_time")} />
        </Field>
        <Field label="모집 인원 (명)" error={errors.capacity}>
          <input inputMode="numeric" className={inputClass} value={values.capacity} onChange={set("capacity")} placeholder="예: 6" />
        </Field>
        <Field label="참가비 (원)" error={errors.fee} hint="무료면 0을 적어 주세요.">
          <input inputMode="numeric" className={inputClass} value={values.fee} onChange={set("fee")} placeholder="예: 5000" />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="작성자 이름" error={errors.author_name}>
          <input className={inputClass} value={values.author_name} onChange={set("author_name")} />
        </Field>
        <Field label="연락 방법" error={errors.contact} hint="참가하려는 사람이 연락할 방법을 적어 주세요.">
          <input className={inputClass} value={values.contact} onChange={set("contact")} placeholder="예: 오픈채팅 링크" />
        </Field>
      </div>

      <Field label="설명 (선택)" error={errors.description}>
        <textarea className={inputClass} rows={4} value={values.description} onChange={set("description")} />
      </Field>

      <Field
        label={editing ? "비밀번호 확인 (숫자 4자리)" : "비밀번호 (숫자 4자리)"}
        error={errors.password}
        hint={editing ? "글을 올릴 때 정한 비밀번호를 적어 주세요." : "나중에 글을 고치거나 지울 때 필요해요. 꼭 기억해 두세요."}
      >
        <input type="password" inputMode="numeric" maxLength={4} className={inputClass} value={values.password} onChange={set("password")} />
      </Field>

      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={saving} className={primaryBtn}>
          {saving ? "저장하는 중..." : editing ? "수정 저장" : "올리기"}
        </button>
        <button type="button" className={subBtn} onClick={() => router.back()}>
          취소
        </button>
      </div>
    </form>
  );
}
