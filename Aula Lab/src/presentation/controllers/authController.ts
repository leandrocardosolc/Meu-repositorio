import { GetByEmailUseCase } from "@application/useCases/GetByEmailUseCase";
import { UserRepository } from "infrasctructure/repositories/UserRepository";
import { Request, Response } from "express";

import bcrypt from "bcrypt"
import { generateToken } from "utils/jwt";

export class AuthController {
  
  private readonly getByEmailUseCase: GetByEmailUseCase;

  constructor() {
    const userRepository = new UserRepository();
    this.getByEmailUseCase = new GetByEmailUseCase(userRepository);
  }


  async login(req:Request, res:Response){

    try {
        const {email,password} = req.body;

        const user = await this.getByEmailUseCase.execute(email);

        if(!user){

            return res.status(404).json({error:"Usuario não encontrado"})
        }

        console.log("user",user)
        console.log(password , user.password );
        const issPasswordValid = await bcrypt.compare(password ?? "", user.password ?? "");

        if(!issPasswordValid){
             return res.status(401).json({error:"Senha invalida"})
        }

        const token = generateToken({id:user.id,email:user.email});

        return res.status(200).json({token:token})

    } catch (error) {
        
    }
  }
}