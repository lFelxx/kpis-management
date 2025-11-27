import { AuthCredentials } from "../../core/domain/auth/AuthCredentials";
import { User } from "../../core/domain/auth/User";
import { useAuthStore } from "../../presentation/stores/auth/auth.store"

export const useAuth = () =>{
    const {
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        checkAuth,
    } = useAuthStore();

    const handleLogin = async (credentials: AuthCredentials): Promise<User | null> =>{
        try {
            const loggedUser = await login(credentials);
            return loggedUser;
        } catch (error) {
            return null;
        }
    };

    const handleLogout = async () =>{
        try {
            await logout();
        } catch (error) {
            
        }
    };

    const handleCheckAuth = async (): Promise<User | null> =>{
        try {
            return await checkAuth();
        } catch (error) {
            return null;
        }
    };

    return {
        user,
        isAuthenticated,
        loading,
        login: handleLogin,
        logout: handleLogout,
        checkAuth: handleCheckAuth,
      };
};