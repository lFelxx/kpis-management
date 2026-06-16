import { create } from "zustand";
import { AuthCredentials } from "../../../core/domain/auth/AuthCredentials";
import { User } from "../../../core/domain/auth/User";
import {
    loginUseCase,
    logoutUseCase,
    getCurrentUserUseCase,
    notificationService,
} from "../../../core/instances/instances";

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (credentials: AuthCredentials) => Promise<User | null>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<User | null>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    loading: false,

    login: async (credentials: AuthCredentials) => {
        set({ loading: true });
        try {
            const user = await loginUseCase.execute(credentials);
            set({ user, isAuthenticated: true });
            notificationService.showSuccess(`Bienvenido, ${user.username}`);
            return user;
        } catch (error) {
            notificationService.showError((error as Error).message);
            set({ user: null, isAuthenticated: false });
            return null;
        } finally {
            set({ loading: false });
        }
    },

    logout: async () => {
        set({ loading: true });
        try {
            await logoutUseCase.execute();
            set({ user: null, isAuthenticated: false });
        } catch (error) {
            notificationService.showError((error as Error).message);
        } finally {
            set({ loading: false });
        }
    },

    checkAuth: async () => {
        set({ loading: true });
        try {
            const user = await getCurrentUserUseCase.execute();
            set({ user, isAuthenticated: !!user });
            return user;
        } catch (error) {
            notificationService.showError((error as Error).message);
            set({ user: null, isAuthenticated: false });
            return null;
        } finally {
            set({ loading: false });
        }
    },
}));
