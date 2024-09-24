import mongoose from "mongoose";
import User from "../models/UserModel.js";
import Message from "../models/MessageModel.js";

export const searchContacts = async (req, res, next) => {
  try {
    const searchItem = req.body.params.searchItem;
    const id = req.body.params.userID;

    if (searchItem === undefined || searchItem === "") {
      return res.status(400).json("Search item is required");
    }

    const sanitizedSearchItem = searchItem.replace(
      /[-[\]{}()*+?.,\\^$|#\s]/g,
      "\\$&"
    );

    const regex = new RegExp(sanitizedSearchItem, "i");
    const searchResults = await User.find({
      $and: [
        { _id: { $ne: id } },
        {
          $or: [{ email: regex }, { nickname: regex }],
        },
      ],
    });

    return res.status(200).json(searchResults);
  } catch (error) {
    console.log(error);
    return res.status(500).json("Internal server error");
  }
};

export const getContactsForDMList = async (req, res, next) => {
  try {
    let userID = req.body.params.userID;
    userID = new mongoose.Types.ObjectId(userID);

    const contacts = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userID }, { receiver: userID }],
        },
      },
      {
        $sort: { timestamp: -1 },
      },
      {
        $group: {
          _id: {
            $cond: {
              if: { $eq: ["$sender", userID] },
              then: "$receiver",
              else: "$sender",
            },
          },
          lastMessageTime: { $first: "$timestamp" },
          lastMessageContent: { $first: "$content" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "contactInfo",
        },
      },
      {
        $unwind: "$contactInfo",
      },
      {
        $project: {
          _id: 1,
          lastMessageTime: 1,
          lastMessageContent: 1,
          nickname: "$contactInfo.nickname",
          email: "$contactInfo.email",
        },
      },
      {
        $sort: { lastMessageTime: -1 },
      },
    ]);

    return res.status(200).json({contacts});
  } catch (e) {
    console.log(e);
    return res.status(500).json("Internal server error");
  }
};
