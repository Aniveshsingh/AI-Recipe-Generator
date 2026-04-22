import jwt from "jsonwebtoken";
import User from "../models/User.model.js";

export const optionalAuth = async (req, _res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (token) {
      try {
        const decode = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decode.userId).select("-password");
      } catch {
        req.user = null;
      }
    } else {
      req.user = null;
    }
    next();
  } catch {
    req.user = null;
    next();
  }
};

export const protect = async (req, res, next) => {
  try {
    console.log("SECRET:", process.env.JWT_SECRET);
    let token;
    console.log("Auth header:", req.headers);
    // Get token from header
    if (req.headers.authorization?.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }
    console.log("Extracted token", token);
    // no token
    if (!token) {
      return res.status(400).json({ message: "Not authorized" });
    }

    // verify token
    const decode = jwt.verify(token, process.env.JWT_SECRET);

    // get user from database without password
    req.user = await User.findById(decode.userId).select("-password");
    next();
  } catch (error) {
    console.log("ERROR TYPE:", error.name);
    console.log("ERROR MESSAGE:", error.message);
    res.status(401).json({ message: "not authorized, invalid token" });
  }
};
