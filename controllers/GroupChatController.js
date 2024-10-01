import User from "../models/UserModel.js";
import GroupChat from "../models/GroupChatModel.js";

export const createGroupChat = async (req, res) => {
  try {
    const { name, members } = req.body;
    const userID = req.body.userID;

    const admin = await User.findById(userID);

    if (!admin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    const validMembers = await User.find({ _id: { $in: members } });
    if (validMembers.length !== members.length) {
      return res.status(404).json({ message: "Some members not found" });
    }

    const groupChat = new GroupChat({
      name,
      members,
      admin: userID,
    });
    await groupChat.save();
    console.log("Group chat created");
    return res.status(201).json({groupChat});
  } catch (error) {
    console.error("Error creating group chat:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUserGroupChats = async (req, res) => {
  try {
    const userID = req.body.params.userID;
    console.log("userID", userID);
    const groupChats = await GroupChat.find({
      $or: [{ admin: userID }, { members: userID }],
    }).sort({ updateAt: -1 });
    return res.status(200).json({groupChats});
  } catch (error) {
    console.error("Error getting user group chats:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
