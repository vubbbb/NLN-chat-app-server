import { Router } from "express";
import {
  signup,
  login,
  getUserInfo,
  updateProfile,
  addProfileImage,
  removeProfileImage,
} from "../controllers/AuthController.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import multer from "multer";

const authRoutes = Router();
const upload = multer({ dest: '/tmp' });

authRoutes.post("/signup", signup);
authRoutes.post("/login", login);
authRoutes.get("/user-info", getUserInfo);
authRoutes.post("/update-profile", updateProfile);
authRoutes.post(
  "/add-profile-image",
  upload.single("profile-image"),
  addProfileImage
);
authRoutes.delete("/remove-profile-image", removeProfileImage);

export default authRoutes;
