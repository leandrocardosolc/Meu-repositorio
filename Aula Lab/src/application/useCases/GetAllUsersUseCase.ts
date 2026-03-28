import { User } from "@domain/entities/User";
import { IUserRepository } from "@domain/repositories/IUserRepository";
import { UserDTO } from "@presentation/dtos/UserDTO";

export class GetAllUsersUseCase{

    constructor(private userRepository: IUserRepository){

    }

    async execute(): Promise<UserDTO[]>{
        return await this.userRepository.findAll() ?? [];
    }
}