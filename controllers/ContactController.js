import User from "../models/UserModel.js";

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
