import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { Request, Response, NextFunction } from "express";

export function validateDTO(dtoClass: any) {
    return async (req: Request, res: Response, next: NextFunction) => {
        const output = plainToInstance(dtoClass, req.body);
        const errors = await validate(output);

        if (errors.length > 0) {
            res.status(322).json({
                errors: errors.map(err => err.constraints),
            });
            return;
        }

        req.body = output;
        next();
    }
}