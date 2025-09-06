// routes/user.route.js
import express from 'express';
// Add getMe to the import list
import { getAllUsers, getSingleUser, login, logOut, register, getMe, editProfile, getProfile } from '../controller/user.controller.js';
import auth from '../middleware/auth.js';

const userRouter = express.Router();

userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.post("/logout", logOut);

userRouter.get("/me", auth, getMe);

userRouter.get("/get", auth, getAllUsers);
userRouter.get("/:id", auth, getSingleUser);
userRouter.get("/edit", auth, editProfile);
userRouter.get("/getProfile/:userName",auth,getProfile)

export default userRouter;