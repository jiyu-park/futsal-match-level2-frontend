"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ErrorBox } from "@/components/ui";
import { RecentReviews, StatCards } from "@/components/ProfileParts";
import { api, ApiError, Profile } from "@/lib/api";

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Profile>(`/users/${id}`).then(setProfile).catch((e: ApiError) => setError(e.message));
  }, [id]);

  if (error) return <ErrorBox>{error}</ErrorBox>;
  if (!profile) return <p className="text-slate-500">불러오는 중...</p>;
  return (
    <div className="space-y-5">
      <Link href="/" className="text-sm text-slate-500 hover:underline">← 목록으로</Link>
      <h1 className="text-2xl font-bold">{profile.nickname}</h1>
      <StatCards profile={profile} />
      <RecentReviews profile={profile} />
    </div>
  );
}
