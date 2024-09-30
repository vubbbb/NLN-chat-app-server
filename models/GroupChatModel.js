import mongoose from "mongoose";

const groupChatSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  members: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  ],
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  messages: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Message", required: false },
  ],
  createdAT: {
    type: Date,
    default: Date.now,
  },
  updateAt: {
    type: Date,
    default: Date.now,
  },
});

groupChatSchema.pre("save", function (next) {
  this.updateAt = Date.now();
  next();
});

groupChatSchema.pre("findOneAndUpdate", function (next) {
  this.set({ updateAt: Date.now() });
  next();
});

const GroupChat = mongoose.model("GroupChat", groupChatSchema);
export default GroupChat;
