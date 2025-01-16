import { asyncHandler } from "../utils/asyncHandler.js";
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
    const { userId } = req.params
    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "valid user id is required")
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

const getTweetById = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "invalid tweet id")
    }

    const tweet = await Tweet.findById(tweetId)

    if (!tweet) {
        throw new ApiError(400, "Invalid tweet id Or unable to fetch tweet")
    }


    return res
        .status(200)
        .json(
            new ApiResponse(200, tweet, "tweet fetched successfully")
        )
})

const updateTweet = asyncHandler(async (req, res) => {
    const { content } = req.body
    const { tweetId } = req.params
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "invalid tweet id")
    }

    if (!req.user?._id) {
        throw new ApiError(400, "Unauthorized request")
    }

    const updatedTweet = await Tweet.findOneAndUpdate({
        _id: tweetId,
        owner: req.user._id
    }, {
        content
    }, {
        new: true
    })

    if (!updateTweet) {
        throw new ApiError(500, "Unable to update tweet")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedTweet, "tweet updated successfully")
        )

})

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "invalid tweet id")
    }

    if (!req.user?._id) {
        throw new ApiError(400, "Unauthorized request")
    }

    const deletedTweet = await Tweet.deleteOne({
        _id: tweetId,
        owner: req.user._id
    })

    if (!deletedTweet) {
        throw new ApiError(400, "Unable to fetch tweet")
    }



    return res
        .status(200)
        .json(
            new ApiResponse(200, deletedTweet, "tweet removed")
        )
})

export {
    addTweet,
    getUserTweets,
    getTweetById,
    updateTweet,
    deleteTweet
}