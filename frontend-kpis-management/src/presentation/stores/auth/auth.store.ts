import { create } from "zustand";
import { AuthCredentials } from "../../../core/domain/auth/AuthCredentials";
import { User } from "../../../core/domain/auth/User";
import { GetCurrentUserUseCase } from "../../../core/usecases/auth/GetCurrentUserUseCase";
import { LoginUseCase } from "../../../core/usecases/auth/LoginUseCase";
import { LogoutUseCase } from "../../../core/usecases/auth/LogoutUseCase";
import { AuthApiRepositoryHttp } from "../../../infrastructure/api/AuthApiRepositoryHttp";
import { ToastNotificationService } from "../../../infrastructure/services/ToastNotificationService";

interface AuthState{
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (credentials: AuthCredentials) => Promise<User | null>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<User | null>;
}

const authRepository = new AuthApiRepositoryHttp();
const loginUseCase = new LoginUseCase(authRepository);
const logoutUseCase = new LogoutUseCase(authRepository);
const getCurrentUserUseCase = new GetCurrentUserUseCase(authRepository);
const toast = new ToastNotificationService();

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    loading: false,

    login: async(credentials: AuthCredentials) =>{
        set({ loading: true});
        try {
            const user = await loginUseCase.execute(credentials);
            set({ user, isAuthenticated: true});
            toast.showSuccess(`Bienvenido, ${user.username}`);
            return user;
        } catch (error) {
            toast.showError((error as Error).message);
            set({ user: null, isAuthenticated: false });
            return null;
        }finally {
            set({ loading: false });
          }
    },

    logout: async () => {
        set({ loading: true});
        try {
            await logoutUseCase.execute();
            set({ user: null, isAuthenticated: false});
        } catch (error) {
            toast.showError((error as Error).message);
        }finally {
            set({ loading: false });
          }
    },

    checkAuth: async () => {
        set({ loading: true})
        try {
            const user = await getCurrentUserUseCase.execute();
            set({ user, isAuthenticated: !!user})
            return user;
        } catch (error) {
            toast.showError((error as Error).message);
            set({ user: null, isAuthenticated: false });
            return null;
        }finally {
            set({ loading: false });
          }
    }
}))
