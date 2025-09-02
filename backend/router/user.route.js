// routes/user.route.js
import express from 'express';
// Add getMe to the import list
import { getAllUsers, getSingleUser, login, logOut, register, getMe } from '../controller/user.controller.js';
import auth from '../middleware/auth.js';

const userRouter = express.Router();

userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.post("/logout", logOut);

// NEW ROUTE: Add this line
userRouter.get("/me", auth, getMe);

userRouter.get("/get", auth, getAllUsers);
userRouter.get("/:id", auth, getSingleUser);

export default userRouter;