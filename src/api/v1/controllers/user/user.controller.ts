import { NextFunction, Request, Response } from "express";
import { UserService } from "../../services/user.service";

export class UserController {
    userServiceInstance!: UserService;

    constructor() {
        this.userServiceInstance = new UserService();
    }

    saveUserCallback = (req: Request, res: Response, next: NextFunction): void => {
        try {
            const user = req.body;
            if (!user) {
                res.status(400).json({ message: 'Invalid request body' });
                return;
            }
            const saveUserResponse = this.userServiceInstance.save(user);
            res.status(201).json(saveUserResponse);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ message: 'Error' });
        }
    }

    getAll = (req: Request, res: Response, next: NextFunction) => {
        const saveUserResponse = this.userServiceInstance.save(1);
        return res.status(200).json(saveUserResponse);
    }

}


