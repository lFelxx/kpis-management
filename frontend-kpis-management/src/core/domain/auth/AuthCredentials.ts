export class AuthCredentials{
    readonly username: string;
    readonly password: string;

    constructor(username: string, password: string){
        if (!username || !password) throw new Error('Credenciales inválidas'); {
            this.username = username;
            this.password = password;
        }
    }
}