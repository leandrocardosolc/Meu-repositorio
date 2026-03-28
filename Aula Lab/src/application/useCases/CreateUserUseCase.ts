import { IUserRepository } from "@domain/repositories/IUserRepository";
import { User } from "@domain/entities/User";
import bcrypt from "bcrypt";
export class CreateUserUseCase {
    constructor(private userRepository: IUserRepository){}

    async execute(name: string, email: string, password:string): Promise<User> {
     const existingUser = await this.userRepository.findByEmail(email);

        console.log(name, email, password);
        if (existingUser) {
            throw new Error("Já existe um usuário registrado com este e-mail.");
        }

        const hashPassword = await bcrypt.hash(password ?? "",10)
        console.log("senha",password)
        console.log("hash",hashPassword)
        const user = new User(name, email, hashPassword);

        return await this.userRepository.save(user);
    }
}