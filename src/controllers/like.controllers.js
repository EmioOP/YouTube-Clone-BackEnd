import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Like } from "../models/like.models.js"


const toggleLike = async (userId, contentId, contentType) => {
    if (!userId || !contentId || !contentType) {
        throw new ApiError(400, "userId contentId content type are required")
    }

    const videoLiked = await Like.findOne({
        contentType: contentId,
        likedBy: userId
    })

    if (videoLiked) {
         await videoLiked.remove()
         return {status:`${contentType} like removed`,contentId,userId}
    } else {
        const newLike = await Like.create({
            contentType: contentId,
            likedBy: userId
        })

        return {status:`${contentType} liked`,contentId,userId}
    }
}

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }
    if (!req.user?._id) {
        throw new ApiError(400, "Invalid unauthorized request")
    }

    const like = await toggleLike(req.user._id,videoId,"video")

   

    if (!like) {
        throw new ApiError(500, "unable to toggle like video")
    }



    return res
        .status(200)
        .json(
            new ApiResponse(200, like, like.status)
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

    const like = await toggleLike(req.user._id,videoId,"comment")

   

    if (!like) {
        throw new ApiError(500, "unable to toggle like comment")
    }



    return res
        .status(200)
        .json(
            new ApiResponse(200, like, like.status)
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

    const like = await toggleLike(req.user._id,videoId,"tweet")

   

    if (!like) {
        throw new ApiError(500, "unable to toggle like tweet")
    }



    return res
        .status(200)
        .json(
            new ApiResponse(200, like, like.status)
        )

})
const allLikedVideos = asyncHandler(async(req,res)=>{
    if(!req.user?.id){
        throw new ApiError(400,"Unauthorized request")
    }

    const likedVideos = await Like.find({
        likedBy:req.user._id
    })

    if(!likedBy){
        throw new ApiError(500,"Unable to fetch liked videos")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,likedVideos,"Liked videos fetched")
    )
})

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    allLikedVideos
}