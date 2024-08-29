import { compare } from "bcrypt";
import User from "../models/UserModel.js";
import { renameSync, unlinkSync } from "fs";
import cloudinary from "../configs/cloudinary.js";

const maxAge = 3 * 24 * 60 * 60 * 1000;


export const updateProfile = async (req, res, next) => {
  try {
    const userID = req.body.params.userID;
    const firstName= req.body.params.firstName;
    const lastName= req.body.params.lastName;
    if (!firstName || !lastName) {
      return res.status(400).send("First name and last name are required");
    }
    const userData = await User.findByIdAndUpdate(
      userID,
      { firstName, lastName, profileSetup: true }
    );
    console.log("here");
    return res.status(201).json({
      id: userData.id,
      email: userData.email,
      profileSetup: userData.profileSetup,
      firstName: userData.firstName,
      lastName: userData.lastName,
      image: userData.image,
      color: userData.color,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json("Internal server error");
  }
};

export const getUserInfo = async (req, res, next) => {
  try {
    const userData = await User.findById(req.query.userID);
    console.log(req.query.userID);
    if (!userData) {
      return res.status(404).send("User not found");
    }
    return res.status(201).json({
      id: userData.id,
      email: userData.email,
      profileSetup: userData.profileSetup,
      firstName: userData.firstName,
      lastName: userData.lastName,
      image: userData.image,
      color: userData.color,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json("Internal server error");
  }
};

export const signup = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json("Email and password are required");
    }
    const user = await User.create({ email, password });
    res.cookie("jwt", createToken(user.email, user.id), {
      maxAge,
      secure: true,
      sameSite: "none",
    });
    return res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        profileSetup: user.profileSetup,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json("Internal server error");
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).send("Email and password is required");
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send("User not found");
    }
    const auth = await compare(password, user.password);
    if (!auth) {
      return res.status(401).send("Password is incorrect");
    }
    res.cookie("jwt", createToken(user.email, user.id), {
      maxAge,
      secure: true,
      sameSite: "none",
    });
    return res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        profileSetup: user.profileSetup,
        firstName: user.firstName,
        lastName: user.lastName,
        image: user.image,
        color: user.color,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json("Internal server error");
  }
};

export const addProfileImage = async (req, res) => {
  try {
    console.log(req.file);
  //   const result = await cloudinary.uploader.upload(req.file.path, {
  //     folder: "profiles",
  //   });

  //   // Xóa file tạm thời sau khi upload lên Cloudinary
  //   unlinkSync(req.file.path);

  //   const updatedUser = await User.findByIdAndUpdate(
  //     req.query.userID,
  //     { image: result.secure_url },
  //     { new: true, runValidators: true }
  //   );

  //   return res.status(201).json({
  //     image: updatedUser.image,
  //   });
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
