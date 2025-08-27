import express from 'express';
import { getAllUsers, getSingleUser, login, register } from '../controller/user.controller.js';
import auth from '../middleware/auth.js';

const userRouter = express.Router();

userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.get("/get",auth, getAllUsers);
userRouter.get("/:id",auth, getSingleUser)

export default userRouter;
   