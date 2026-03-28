import { error } from "console";
import { Request, Response, NextFunction } from "express";
import { verifyToken } from "utils/jwt";
export interface IAuthenticateRequest extends Request{

    user ? :any
}

export const authenticateJWT = (req: IAuthenticateRequest, res :Response, next: NextFunction) =>{
    const authHeader = req.headers?.authorization;

    if(!authHeader?.startsWith("Bearer")){
        return res.status(403).json({error:"unauthorized"})
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = verifyToken(authHeader);
        req.user = decoded
        next()
    } catch (error) {

        console.error("jwr middleware error ",error)
        res.status(403).json({error:"forbidden"})
    }

}