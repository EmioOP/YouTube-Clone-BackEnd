import { asyncHandler } from "../utils/asyncHandler";
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import { Tweet } from "../models/tweet.models.js";
import { isValidObjectId } from "mongoose";


const addTweet = asyncHandler(async(req,res)=>{
    const {content} = req.body
    const owner = req.user?._id

    if(!isValidObjectId(owner)){
        throw new ApiError(400,"Unauthorized request")
    }

    if(!content){
        throw new ApiError(400,"content is required")
    }

    const tweet = await Tweet.create({
        content,
        owner
    })

    return res
    .status(200)
    .json(
        new ApiResponse(200,tweet,"tweet added successfully")
    )
})

