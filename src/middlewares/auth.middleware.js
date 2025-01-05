import jwt from "jsonwebtoken"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import {asyncHandler} from "../utils/asyncHandler.js"


export const verifyJWT = asyncHandler(async (req, res, next) => {
    const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
        throw new ApiError(400, "Unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        if (!decodedToken) {
            throw new ApiError(400, "Invalid Access Token")
        }
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
        if (!user) {
            throw new ApiError(400, "Invalid Access Token")
        }

        req.user = user
        next()

    } catch (error) {
        throw new ApiError(401,error.message || "invalid Access Token")
    }
})
