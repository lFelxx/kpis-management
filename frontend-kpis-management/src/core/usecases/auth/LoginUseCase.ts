import { AuthCredentials } from "../../domain/auth/AuthCredentials";
import { AuthRepository } from "../../domain/auth/AuthRepository";
import { User } from "../../domain/auth/User";

export class LoginUseCase{
    constructor(private readonly authRepo: AuthRepository){}

    async execute(credentials: AuthCredentials): Promise<User>{
        return this.authRepo.login(credentials);
    }
}