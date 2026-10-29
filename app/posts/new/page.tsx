import PostForm from "@/components/PostForm";

export default function NewPostPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">모집글 올리기</h1>
      <PostForm />
    </div>
  );
}
