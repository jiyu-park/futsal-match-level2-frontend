"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import StadiumForm from "@/components/StadiumForm";
import { api, ApiError, Stadium } from "@/lib/api";
import { ErrorBox } from "@/components/ui";

export default function EditStadiumPage() {
  const { id } = useParams<{ id: string }>();
  const [stadium, setStadium] = useState<Stadium | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Stadium[]>("/stadiums")
      .then((list) => {
        const found = list.find((s) => String(s.id) === id);
        if (found) setStadium(found);
        else setError("찾을 수 없는 경기장입니다.");
      })
      .catch((e: ApiError) => setError(e.message));
  }, [id]);

  if (error) return <ErrorBox>{error}</ErrorBox>;
  if (!stadium) return <p className="text-slate-500">불러오는 중...</p>;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">경기장 관리</h1>
      <StadiumForm stadium={stadium} />
    </div>
  );
}
