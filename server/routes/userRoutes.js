import express from "express";
import { getUserById, getUserResumes, loginUser, registerUser, refreshToken, logout, verifyOTP, resendOTP, forgotPassword, verifyResetOTP, resetPassword } from "../controllers/userController.js";
import protect from "../middlewares/authMiddleware.js";

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/verify-otp', verifyOTP);
userRouter.post('/resend-otp', resendOTP);
userRouter.post('/refresh-token', refreshToken);
userRouter.post('/logout', logout);
userRouter.get('/data', protect, getUserById);
userRouter.get('/resumes', protect, getUserResumes)
userRouter.post('/forgot-password', forgotPassword);
userRouter.post('/verify-reset-otp', verifyResetOTP);
userRouter.post('/reset-password', resetPassword);

export default userRouter;
