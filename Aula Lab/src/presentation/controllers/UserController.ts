import { Request, Response } from 'express';
import { CreateUserUseCase } from '@application/useCases/CreateUserUseCase';
import { UserRepository } from 'infrasctructure/repositories/UserRepository';
import { UserDTO } from '@presentation/dtos/UserDTO';
 import { GetAllUsersUseCase } from '@application/useCases/GetAllUsersUseCase';
export class UserController{
    private createUserUseCase: CreateUserUseCase;
    private getAllUsersUseCase :GetAllUsersUseCase
    constructor(){
        const userRepository = new UserRepository();
        this.createUserUseCase = new CreateUserUseCase(userRepository);
        this.getAllUsersUseCase = new GetAllUsersUseCase(userRepository);

        //juniocsgon@gmail.com
    }


    async getAllUsers(req: Request, res: Response){
        try {
            const users: UserDTO[] = await this.getAllUsersUseCase.execute();

            if(!users || !users[0].email){
                return res.status(404).json(users);
            }

            return res.status(200).json(users)
        } catch (error) {
            return res.status(400).json({error: (error as Error).message });
        }
    }

    async createUser(req: Request, res: Response) {
        try {
            const { name, email, password } = req.body;
            const user = await this.createUserUseCase.execute(name,email, password);
            
            return res.status(201).json(user);
        } catch (error) {
            return res.status(400).json({error: (error as Error).message });
        }
    }
}