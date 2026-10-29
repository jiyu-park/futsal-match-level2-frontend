"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError, Stadium } from "@/lib/api";
import { dangerBtn, ErrorBox, Field, inputClass, primaryBtn, subBtn } from "./ui";

export default function StadiumForm({ stadium }: { stadium?: Stadium }) {
  const router = useRouter();
  const editing = Boolean(stadium);
  const [values, setValues] = useState({
    name: stadium?.name ?? "",
    district: stadium?.district ?? "",
    address: stadium?.address ?? "",
    floor_type: stadium?.floor_type ?? "",
  });
  const [admin, setAdmin] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const set = (key: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setValues((v) => ({ ...v, [key]: e.target.value }));

  async function run(action: () => Promise<unknown>) {
    setSaving(true);
    setErrors({});
    setMessage("");
    try {
      await action();
      router.push("/stadiums");
    } catch (err) {
      const apiErr = err as ApiError;
      setErrors(apiErr.errors ?? {});
      setMessage(apiErr.message);
      setSaving(false);
    }
  }

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    return run(() =>
      api(editing ? `/stadiums/${stadium!.id}` : "/stadiums", {
        method: editing ? "PATCH" : "POST",
        body: values,
        adminPassword: admin,
      }),
    );
  };

  const remove = () => {
    if (!window.confirm("이 경기장을 지울까요?")) return;
    return run(() => api(`/stadiums/${stadium!.id}`, { method: "DELETE", adminPassword: admin }));
  };

  return (
    <form onSubmit={save} noValidate className="space-y-4">
      {message && <ErrorBox>{message}</ErrorBox>}
      <Field label="경기장 이름" error={errors.name}>
        <input className={inputClass} value={values.name} onChange={set("name")} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="구" error={errors.district}>
          <input className={inputClass} value={values.district} onChange={set("district")} placeholder="예: 마포구" />
        </Field>
        <Field label="바닥 종류 (선택)" error={errors.floor_type}>
          <input className={inputClass} value={values.floor_type} onChange={set("floor_type")} placeholder="예: 인조잔디" />
        </Field>
      </div>
      <Field label="주소" error={errors.address} hint="지도 링크는 이 주소로 자동으로 만들어져요.">
        <input className={inputClass} value={values.address} onChange={set("address")} />
      </Field>
      <Field label="관리자 비밀번호" hint="경기장을 바꾸려면 관리자 비밀번호가 필요해요.">
        <input type="password" className={inputClass} value={admin} onChange={(e) => setAdmin(e.target.value)} />
      </Field>
      <div className="flex flex-wrap gap-2 pt-2">
        <button type="submit" disabled={saving} className={primaryBtn}>
          {editing ? "수정 저장" : "등록"}
        </button>
        <button type="button" className={subBtn} onClick={() => router.back()}>취소</button>
        {editing && (
          <button type="button" disabled={saving} className={dangerBtn} onClick={remove}>삭제</button>
        )}
      </div>
    </form>
  );
}
