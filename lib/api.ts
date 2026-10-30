export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export type Stadium = {
  id: number;
  name: string;
  district: string;
  address: string;
  map_url: string;
  floor_type: string | null;
  post_count?: number;
};

export type Post = {
  id: number;
  stadium_id: number;
  sport: string;
  title: string;
  play_date: string;
  play_time: string;
  capacity: number;
  author_name: string;
  contact: string;
  skill_level: string;
  fee: number;
  description: string | null;
  stadium_name: string;
  stadium_district: string;
  stadium_address: string;
  stadium_map_url: string;
  applied_count: number;
  remaining: number;
  is_ended: boolean;
  owner_id: number | null;
  owner_nickname: string | null;
};

export type User = { id: number; email: string; nickname: string; role: "user" | "admin" };

export type Participant = { user_id: number; nickname: string; role: "host" | "player"; attendance: string };

export type Review = {
  id: number;
  reviewer_id: number;
  reviewer_nickname: string;
  target_id: number;
  target_nickname: string;
  rating: number;
  comment: string | null;
  created_at: string;
};

export type Profile = {
  id: number;
  nickname: string;
  joined_at: string;
  stats: {
    attended_count: number;
    no_show_count: number;
    attendance_rate: number | null;
    hosted_count: number;
    review_count: number;
    manner_average: number | null;
  };
  recent_reviews: { rating: number; comment: string | null; created_at: string; reviewer_nickname: string; post_title: string }[];
};

export type HistoryItem = {
  post_id: number;
  title: string;
  play_date: string;
  play_time: string;
  stadium_name: string;
  is_ended: boolean;
  attendance?: string;
  application_id?: number;
  applied_count?: number;
};

export const ATTENDANCE_LABEL: Record<string, string> = {
  pending: "참석 확인 전",
  attended: "참석",
  no_show: "불참(노쇼)",
};

const TOKEN_KEY = "futsal_token";
export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};
export const setToken = (token: string | null) => {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {}
};

export type Application = {
  id: number;
  user_id: number | null;
  applicant_name: string;
  attendance: string;
  created_at: string;
};

export type Stats = {
  today_applications: number;
  open_posts: number;
  remaining_seats: number;
};

export function postStatus(p: Post): { label: string; tone: "open" | "full" | "ended" } {
  if (p.is_ended) return { label: "경기 종료", tone: "ended" };
  if (p.remaining <= 0) return { label: "정원 마감", tone: "full" };
  return { label: `남은 자리 ${p.remaining}`, tone: "open" };
}

export const SPORTS = ["풋살"];
export const SKILL_LEVELS = ["입문", "중급", "상급", "상관없음"];

// 백엔드가 돌려준 쉬운 말 오류를 그대로 들고 다니는 오류
export class ApiError extends Error {
  errors: Record<string, string>;
  constructor(message: string, errors: Record<string, string> = {}) {
    super(message);
    this.errors = errors;
  }
}

export async function api<T>(
  path: string,
  options: { method?: string; body?: unknown; adminPassword?: string } = {},
): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: options.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
        ...(options.adminPassword ? { "x-admin-password": options.adminPassword } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      cache: "no-store",
    });
  } catch {
    throw new ApiError("서버에 연결할 수 없어요. 잠시 뒤에 다시 시도해 주세요.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(data.message ?? "문제가 생겼어요. 다시 시도해 주세요.", data.errors ?? {});
  }
  return data as T;
}

export function formatDate(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  const day = ["일", "월", "화", "수", "목", "금", "토"][new Date(y, m - 1, d).getDay()];
  return `${m}월 ${d}일 (${day})`;
}

export function formatFee(fee: number) {
  return fee === 0 ? "무료" : `${fee.toLocaleString("ko-KR")}원`;
}
