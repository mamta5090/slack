import express from 'express';
import { getAllUsers, getSingleUser, login, register } from '../controller/user.controller.js';

const userRouter = express.Router();

userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.get("/get",getAllUsers);
userRouter.get("/:id",getSingleUser)

export default userRouter;
   