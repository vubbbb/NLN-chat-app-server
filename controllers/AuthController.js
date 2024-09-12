import { compare } from "bcrypt";
import User from "../models/UserModel.js";
import { renameSync, unlinkSync } from "fs";
import cloudinary from "../configs/cloudinary.js";
import { set } from "mongoose";

const maxAge = 3 * 24 * 60 * 60 * 1000;

export const updateProfile = async (req, res, next) => {
  try {
    console.log(req.body);
    const email = req.body.email;
    const nickname = req.body.nickname;
    console.log(email, nickname);
    const setupProfile = true;
    if (!nickname) {
      return res.status(400).send("First name and last name are required");
    }
    const userData = await User.findOneAndUpdate(
      { email: email },
      { nickname, setupProfile },
      { new: true }
    );
    return res.status(201).json({
      user: {
        userID: userData.id,
        email: userData.email,
        nickname: userData.nickname,
        setupProfile: userData.setupProfile,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json("Internal server error");
  }
};

export const getUserInfo = async (req, res, next) => {
  try {
    const userData = await User.findOne({ email: req.body.params.email });
    if (!userData) {
      return res.status(404).send("User not found");
    }
    return res.status(201).json({
      user: {
        userID: userData.id,
        email: userData.email,
        nickname: userData.nickname,
        setupProfile: userData.setupProfile,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json("Internal server error");
  }
};

export const signup = async (req, res, next) => {
  try {
    const { email, nickname, setupProfile } = req.body;
    if (!email) {
      return res.status(400).json("Email is required");
    }
    const checkUser = await User.findOne({ email });
    if (checkUser) {
      return res.status(201).json({
        user: {
          userID: checkUser.id,
          email: checkUser.email,
          nickname: checkUser.nickname,
          setupProfile: checkUser.setupProfile,
        },
      });
    } else {
      const user = await User.create({ email, nickname, setupProfile });
      return res.status(201).json({
        user: {
          userID: user.id,
          email: user.email,
          nickname: user.nickname,
          setupProfile: user.setupProfile,
        },
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json("Internal server error");
  }
};

// export const login = async (req, res, next) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password) {
//       return res.status(400).send("Email and password is required");
//     }
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).send("User not found");
//     }
//     const auth = await compare(password, user.password);
//     if (!auth) {
//       return res.status(401).send("Password is incorrect");
//     }
//     res.cookie("jwt", createToken(user.email, user.id), {
//       maxAge,
//       secure: true,
//       sameSite: "none",
//     });
//     return res.status(201).json({
//       user: {
//         id: user.id,
//         email: user.email,
//         profileSetup: user.profileSetup,
//         nickname: user.nickname,
//         lastName: user.lastName,
//         image: user.image,
//         color: user.color,
//       },
//     });
//   } catch (error) {
//     console.log(error);
//     return res.status(500).json("Internal server error");
//   }
// };

export const addProfileImage = async (req, res) => {
  try {
    const userID = req.body.params.userID;
    const image = req.body.params.image;
    const updatedUser = await User.findByIdAndUpdate(userID, { image });
    return res.status(201).json({
      image: updatedUser.image,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json("Internal server error");
  }
};

export const removeProfileImage = async (req, res, next) => {
  try {
    const userID = req.userID;
    const userData = await User.findById(userID);
    if (userData && userData.image) {
      // Tách Public ID từ đường dẫn ảnh
      const imageUrl = userData.image;
      const publicId = "profiles/" + imageUrl.split("/").pop().split(".")[0];

      // Xóa ảnh trên Cloudinary
      cloudinary.uploader.destroy(publicId, async function (error, result) {
        if (error) {
          console.error("Error deleting image:", error);
        } else {
          console.log("Delete result:", result);
          userData.image = null;
          await userData.save();
          return res.status(201).json("Image removed successfully");
        }
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json("Internal server error");
  }
};
