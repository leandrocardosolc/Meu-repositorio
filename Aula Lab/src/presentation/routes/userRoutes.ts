import { Router } from "express";
import { UserController } from "@presentation/controllers/UserController";
import { validateDTO } from "@presentation/controllers/middlewares/validateDTO";
import { UserDTO } from "@presentation/dtos/UserDTO";
import { authenticateJWT } from "@presentation/controllers/middlewares/authenticateJWT";


const router = Router();
const userController = new UserController();

router.get("/users",authenticateJWT as any,async  (req, res,next) => { 
    try {
        await userController.getAllUsers(req,res);
    } catch (error) {
        next(error);
    }
 });

router.post("/users",validateDTO(UserDTO), async(req, res, next) => {
    try {
        await userController.createUser(req, res);
    } catch (error) {
        next(error);
    }
} );

export default router;