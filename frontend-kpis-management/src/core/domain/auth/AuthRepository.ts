import { AuthCredentials } from "./AuthCredentials";
import { User } from "./User";

export interface AuthRepository{
    login(credentials: AuthCredentials): Promise<User>
    logout(): Promise<void>;
    getCurrentUser(): Promise<User | null>;
}