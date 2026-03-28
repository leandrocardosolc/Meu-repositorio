import { AuthController } from "@presentation/controllers/authController";
import { validateDTO } from "@presentation/controllers/middlewares/validateDTO";
import { AuthDTO } from "@presentation/dtos/AuthDTO";
import { Router } from "express";

const routes = Router();

const authController = new AuthController();


routes.post("/",validateDTO(AuthDTO),async(req, res,next)=>{

    try {
        await authController.login(req,res)
    } catch (error) {
        next
    }
}) ;


export default routes;