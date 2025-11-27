import { AuthCredentials } from "../../core/domain/auth/AuthCredentials";
import { AuthRepository } from "../../core/domain/auth/AuthRepository";
import { User } from "../../core/domain/auth/User";
import { ToastNotificationService } from "../services/ToastNotificationService";

export class AuthApiRepositoryHttp implements AuthRepository{
    private readonly baseUrl = import.meta.env.VITE_API_URL;
    private toast = new ToastNotificationService();


    async login(credentials: AuthCredentials): Promise<User> {

        try {
            const response = await fetch(`${this.baseUrl}/auth/login`,{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({
                    username: credentials.username,
                    password: credentials.password
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Error al iniciar sesión");
            }

            const data = await response.json();
            localStorage.setItem("token", data.jwt);
            return data as User;

        } catch (error) {
            this.toast.showError((error as Error).message);
            throw error;
        }
        
    }


    async logout(): Promise<void> {
        localStorage.removeItem("token");
    }

    async getCurrentUser(): Promise<User | null> {
        const token = localStorage.getItem("token");
        if (!token) return null;

        try {
            const response = await fetch(`${this.baseUrl}/me`,{
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error("No se pudo obtener el usuario actual");
            }

            const data = await response.json();
            return { ...data, token } as User;
        } catch (error) {
            this.toast.showError((error as Error).message);
            return null;
        }
    }
}