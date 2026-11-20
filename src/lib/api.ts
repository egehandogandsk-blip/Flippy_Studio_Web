export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  plan_slug: string;
  billing_cycle: 'monthly' | 'yearly';
  status: 'active' | 'suspended';
  company: string;
  created_at: string;
}

export interface PricingPlan {
  id: number;
  slug: string;
  name: string;
  description: string;
  monthly_price: number;
  yearly_discount_percent: number;
  price_label: string;
  is_custom: number;
  is_popular: number;
  is_active: number;
  cta_label: string;
  features: string[];
  sort_order: number;
}

export interface Release {
  id: number;
  version: string;
  platform: 'windows' | 'macos' | 'linux' | 'unity' | 'unreal' | 'godot';
  title: string;
  file_name: string;
  file_size: string;
  sha256: string;
  download_url: string;
  release_notes: string;
  is_available: number;
  download_count: number;
  created_at: string;
}

const TOKEN_KEY = 'flippy_auth_token';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(path, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data as T;
}
