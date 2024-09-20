import Message from "../models/MessageModel.js";

export const getMessages = async (req, res, next) => {
    try {
        const { user1, user2 } = req.body;

        if (user1 === undefined || user2 === undefined) {
            return res.status(400).json("User1 and User2 are required");
        }

        const messages = await Message.find({
            $or: [
                { sender: user1, receiver: user2 },
                { sender: user2, receiver: user1 }
            ],
        }).sort({timestamp:1})
        return res.status(200).json(messages);
    } catch (error) {
        console.log(error);
        return res.status(500).json("Internal server error");
    }
};
