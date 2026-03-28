import { User } from "@domain/entities/User";
import { UserDTO } from "@presentation/dtos/UserDTO";

export interface IUserRepository {
    save(user: User): Promise<User>;
    findByEmail(email: string): Promise<User | null>
    findById(id: number): Promise<User | null>
    findAll(): Promise<UserDTO[] | null>
}