import bcryp from "bcrypt";
import jwt from "jsonwebtoken"



const secreteKey = process.env.JWT_SECRET ?? "defaultSecretkey";

export const generateToken = (payload:object , expireIn:string ="1h") => {

    return jwt.sign(
        payload,
        secreteKey,
        {expiresIn: expireIn as jwt.SignOptions["expiresIn"]}
    )
    
}


export const verifyToken = (token:string) =>{

    try {
        return jwt.verify(token, secreteKey)
    } catch (error) {
        console.error("Token invalido",error)

        throw new Error("erro ao validar token");
    }
}