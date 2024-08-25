import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    return res.status(401).send("You are not authenticated");
  }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userID = decoded.userID;
        next();
    } catch (error) {
        console.log(error);
        return res.status(403).send("Invalid token");
    }
};
