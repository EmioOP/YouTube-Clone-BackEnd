import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Tweet } from "../models/tweet.models.js";
import { isValidObjectId } from "mongoose";


const addTweet = asyncHandler(async (req, res) => {
    const { content } = req.body
    const owner = req.user?._id

    if (!isValidObjectId(owner)) {
        throw new ApiError(400, "Unauthorized request")
    }

    if (!content) {
        throw new ApiError(400, "content is required")
    }

    const tweet = await Tweet.create({
        content,
        owner
    })

    return res
        .status(200)
        .json(
            new ApiResponse(200, tweet, "tweet added successfully")
        )
})

const getUserTweets = asyncHandler(async (req, res) => {
    const {userId} = req.params
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Unauthorized request")
    }

    const userTweets = await Tweet.find({
        owner: userId
    })

    if (!userTweets) {
        throw new ApiError(400, "Unable to fetch tweets")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, userTweets, "user tweets fetched succefully")
        )
})

const updateTweet = asyncHandler(async (req, res) => {
    const {content} = req.body
    const {tweetId} = req.params
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"invalid tweet id")
    }

    const tweet = await Tweet.findById(tweetId)

    if(tweet.owner !== req.user?._id){
        throw new ApiError(400,"Unauthorized request")
    }

    tweet.content = content
    const updatedTweet = await tweet.save()

    return res
    .status(200)
    .json(
        new ApiResponse(200,updatedTweet,"tweet updated successfully")
    )

})

const deleteTweet = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"invalid tweet id")
    }

    const tweet = await Tweet.findById(tweetId)

    if(tweet.owner !== req.user?._id){
        throw new ApiError(400,"Unauthorized request")
    }

    await tweet.remove()

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"tweet removed")
    )
})

export {
    addTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}