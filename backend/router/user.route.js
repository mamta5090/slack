import express from 'express';
import { getAllUsers, getSingleUser, login, logOut, register, getMe, editProfile, getProfile } from '../controller/user.controller.js';
import auth from '../middleware/auth.js';
import multer from 'multer';

const upload = multer({ dest: 'uploads/' });

const userRouter = express.Router();

userRouter.post("/register", register);
userRouter.post("/login", login);
userRouter.post("/logout", logOut);

userRouter.get("/me", auth, getMe);

userRouter.get("/get", auth, getAllUsers);
userRouter.get("/:id", auth, getSingleUser);
userRouter.put("/edit/:id", auth, upload.single('avatar'), editProfile);
userRouter.get("/getProfile/:userName",auth,getProfile)

export default userRouter;