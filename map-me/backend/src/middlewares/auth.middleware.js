import { User } from "../models/user.model.js";
import { ApiError } from "../utils/api-err.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJwt = asyncHandler(async(req, _, next)=>{
    // res was unused in above method so i replaced it with underscore
    try {
        const token = req.cookies.accessToken || req.header
        ("Authorization")?.replace("Bearer ", "")
    
        if(!token){
            throw new ApiError(401, "unauthorized request")
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id)
        .select("-password -refreshToken")
    
        if(!user){
            throw new ApiError(401, "invalid access token");
        }
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "invalid access token");
    }
})