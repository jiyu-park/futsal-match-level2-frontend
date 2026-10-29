"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import PostForm from "@/components/PostForm";
import { api, ApiError, Post } from "@/lib/api";
import { ErrorBox } from "@/components/ui";

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api<Post>(`/posts/${id}`).then(setPost).catch((e: ApiError) => setError(e.message));
  }, [id]);

  if (error) return <ErrorBox>{error}</ErrorBox>;
  if (!post) return <p className="text-slate-500">불러오는 중...</p>;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">모집글 수정</h1>
      <PostForm post={post} />
    </div>
  );
}
