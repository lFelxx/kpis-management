import { AuthRepository } from "../../domain/auth/AuthRepository";
import { User } from "../../domain/auth/User";

export class GetCurrentUserUseCase{
    constructor(private readonly authRepo: AuthRepository){}

    async execute(): Promise<User | null>{
        return this.authRepo.getCurrentUser();
    }
}