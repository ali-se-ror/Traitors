import { apiRequest } from "./queryClient";
import type { AuthUser, LoginData, RegisterData } from "@shared/schema";

export interface AuthResponse {
  user: AuthUser;
  currentVote?: string | null;
}

export async function login(data: LoginData): Promise<AuthResponse> {
  const response = await apiRequest("POST", "/api/auth/login", data);
  return response.json();
}

export async function register(data: RegisterData): Promise<AuthResponse> {
  const response = await apiRequest("POST", "/api/auth/register", data);
  return response.json();
}

export async function logout(): Promise<void> {
  await apiRequest("POST", "/api/auth/logout");
}

export async function getCurrentUser(): Promise<AuthResponse> {
  const response = await apiRequest("GET", "/api/auth/me");
  return response.json();
}
