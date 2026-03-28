import { IsEmail, IsNotEmpty } from "class-validator"

export class AuthDTO {
    @IsEmail({}, { message: "O e-mail informado é invalido." })
    @IsNotEmpty({ message: "O e-mail é um campo obrigatório." })
    email!: string;


  
    @IsNotEmpty({ message: "O password é um campo obrigatório." })
    password!: string;

    constructor(_email:string,_password:string){

        this.email = _email;
        this.password = _password;
    }
}