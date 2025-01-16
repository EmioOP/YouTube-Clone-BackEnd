import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Like } from "../models/like.models.js"
import { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.models.js"
import { Tweet } from "../models/tweet.models.js";
import { Video } from "../models/video.models.js";


const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }
    if (!req.user?._id) {
        throw new ApiError(400, "Invalid unauthorized request")
    }

    const videoLiked = await Like.findOneAndDelete({
        video: videoId,
        likedBy: req.user._id
    })

    const like = {}

    if (videoLiked) {
        like.data = {}
        like.status = "video like removed"
    } else {
        const checkVideo = await Video.exists({_id:videoId})
        if(!checkVideo){
            throw new ApiError(400,"Invalid video id")
        }
        const newLike = await Like.create({
            video: videoId,
            likedBy: req.user._id
        })
        if (!newLike) {
            throw new ApiError(500, "unable to toggle like video")
        }
        like.data = newLike
        like.status = "video liked"
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, like.data, like.status)
        )

})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid video id")
    }
    if (!req.user?._id) {
        throw new ApiError(400, "Invalid unauthorized request")
    }

    const existingLike = await Like.findOneAndDelete({
        comment: commentId,
        likedBy: req.user._id
    })


    const like = {}

    if (existingLike) {
        like.data = {}
        like.status = "comment like removed"
    } else {
        // check comment is correct and it is a comment
        const checkComment = await Comment.exists({_id:commentId})
        if(!checkComment){
            throw new ApiError(400,"Invalid comment id")
        }
        const newLike = await Like.create({
            comment: commentId,
            likedBy: req.user._id
        })

        if (!newLike) {
            throw new ApiError(500, "unable to toggle like comment")
        }

        like.data = newLike
        like.status = "comment liked"
    }


    return res
        .status(200)
        .json(
            new ApiResponse(200, like.data, like.status)
        )

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id")
    }
    if (!req.user?._id) {
        throw new ApiError(400, "Invalid unauthorized request")
    }

    const existingLike = await Like.findOneAndDelete({
        tweet: tweetId,
        likedBy: req.user._id
    })


    const like = {}

    if (existingLike) {
        like.data = {}
        like.status = "tweet like removed"
    } else {
        const checkTweet = await Tweet.exists({_id:tweetId})
        if(!checkTweet){
            throw new ApiError(400,"Invalid tweet id")
        }
        const newLike = await Like.create({
            tweet: tweetId,
            likedBy: req.user._id
        })

        if (!newLike) {
            throw new ApiError(500, "unable to toggle like tweet")
        }

        like.data = newLike
        like.status = "tweet liked"
    }


    return res
        .status(200)
        .json(
            new ApiResponse(200, like.data, like.status)
        )
})

const allLikedVideos = asyncHandler(async (req, res) => {
    if (!req.user?.id) {
        throw new ApiError(400, "Unauthorized request")
    }

    const likedVideos = await Like.find({
        likedBy: req.user._id
    })

    if (!likedVideos) {
        throw new ApiError(500, "Unable to fetch liked videos")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, likedVideos, "Liked videos fetched")
        )
})

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    allLikedVideos
}