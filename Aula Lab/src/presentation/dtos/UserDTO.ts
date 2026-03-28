// DDD ==> Domain Driven Development

import { IsEmail, IsNotEmpty, Length , IsOptional} from "class-validator";

export class UserDTO {
    
    @IsOptional()
    id?:number

    @IsNotEmpty({message: "O nome é obrigatório."})
    @Length(5, 70, {message: "O nome deve conter entre 5 e 70 caracteres."})
    name!: string;

    @IsEmail({}, {message: "O e-mail informado é invalido."})
    @IsNotEmpty({message: "O e-mail é um campo obrigatório."})
    email!: string;

    @IsNotEmpty({message: "password é um campo obrigatório."})
    password!: string;



    
    constructor( _name: string, _email: string,_password:string,_id?:number){
        this.id = _id
        this.name = _name;
        this.email = _email;
        this.password = _password;
    }
}