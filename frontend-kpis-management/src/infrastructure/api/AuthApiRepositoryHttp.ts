import { AuthCredentials } from "../../core/domain/auth/AuthCredentials";
import { AuthRepository } from "../../core/domain/auth/AuthRepository";
import { User } from "../../core/domain/auth/User";
import { request } from "./apiClient";

export class AuthApiRepositoryHttp implements AuthRepository {
    constructor(private readonly baseUrl: string) {}

    async login(credentials: AuthCredentials): Promise<User> {
        const response = await fetch(`${this.baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: credentials.username,
                password: credentials.password,
            }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Error al iniciar sesión');
        }

        const data = await response.json();
        localStorage.setItem('token', data.jwt);
        return data as User;
    }

    async logout(): Promise<void> {
        localStorage.removeItem('token');
    }

    async getCurrentUser(): Promise<User | null> {
        const token = localStorage.getItem('token');
        if (!token) return null;

        const response = await request(`${this.baseUrl}/me`, { method: 'GET' }, { requireAuth: true });
        if (!response.ok) return null;

        const data = await response.json();
        return { ...data, token } as User;
    }
}
