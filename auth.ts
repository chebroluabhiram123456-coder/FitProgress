import { apiRequest } from "./queryClient";
import type { User, InsertUser } from "@shared/schema";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends InsertUser {
  name: string;
}

export class AuthService {
  private static readonly STORAGE_KEY = "fittracker_user";

  static saveUser(user: User): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(user));
  }

  static getStoredUser(): User | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  static clearStoredUser(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  static async login(credentials: LoginCredentials): Promise<User> {
    const response = await apiRequest("POST", "/api/auth/login", credentials);
    const user = await response.json();
    this.saveUser(user);
    return user;
  }

  static async register(userData: RegisterData): Promise<User> {
    const response = await apiRequest("POST", "/api/auth/register", userData);
    const user = await response.json();
    this.saveUser(user);
    return user;
  }

  static logout(): void {
    this.clearStoredUser();
  }

  static async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    const response = await apiRequest("PATCH", `/api/users/${userId}`, updates);
    const user = await response.json();
    this.saveUser(user);
    return user;
  }

  static async getCurrentUser(userId: string): Promise<User> {
    const response = await apiRequest("GET", `/api/users/${userId}`);
    return response.json();
  }
}

export default AuthService;
