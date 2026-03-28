import { User } from "@domain/entities/User";
import { IUserRepository } from "@domain/repositories/IUserRepository";
import { UserDTO } from "@presentation/dtos/UserDTO";

export class GetByEmailUseCase{

    constructor(private userRepository: IUserRepository){

    }

    async execute(email: string): Promise<UserDTO | null>{
        const user: User | null = await this.userRepository.findByEmail(email);
        if(!user) return null
        return new UserDTO(
           user?.name, user?.email,user?.password,user.id
        );
    }
}