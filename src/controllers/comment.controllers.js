import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Comment } from "../models/comment.models.js";
import mongoose, { isValidObjectId } from "mongoose";


const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { content } = req.body

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video Id")
    }

    if (!content) {
        throw new ApiError(400, "Comment content is required")
    }

    if (!req.user._id) {
        throw new ApiError(400, "Unauthorized Request")
    }


    const comment = await Comment.create({
        content,
        video: videoId,
        owner: req.user._id
    })

    if (!comment) {
        throw new ApiError(500, "Unable to add comment")
    }


    return res
        .status(200)
        .json(
            new ApiResponse(200, comment, "Comment added")
        )

})

const getAllComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video Id")
    }


    const comments = await Comment.aggregate([
        {
            $match: {
                video:new mongoose.Types.ObjectId(videoId) 
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $limit: 10
        }
    ])

    if (!comments) {
        throw new ApiError(500, "Error while fetching video comments")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, comments, "Comments fetched")
        )

})

const getComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid Video Id")
    }


    const comment = await Comment.findById(commentId)

    if(!comment){
        throw new ApiError(500,"Unable to fetch comment")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,comment,"comment fetched successfully")
    )

})

const updateComment = asyncHandler(async(req,res)=>{
    const { commentId } = req.params
    const {content} = req.body

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid Video Id")
    }

    if(!req.user._id){
        throw new ApiError(400,"Unauthorized request")
    }

    const comment = await Comment.findOne({
        _id:commentId,
        owner:req.user?._id
    })

    if(!comment){
        throw new ApiError(400,"Unauthorized request of updating comment") 
    }

    comment.content = content
    const updatedComment = await comment.save()

    return res
    .status(200)
    .json(
        new ApiResponse(200,updatedComment,"Comment updated")
    )
})

const deleteComment = asyncHandler(async(req,res)=>{
    const { commentId } = req.params

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid Video Id")
    }

    if(!req.user._id){
        throw new ApiError(400,"Unauthorized request")
    }

    const comment = await Comment.findOneAndDelete({
        _id:commentId,
        owner:req.user?._id
    })

    if(!comment){
        throw new ApiError(400,"Unauthorized request of deleting comment") 
    }


    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"Comment removed")
    )
})

export {
    addComment,
    getAllComment,
    getComment,
    updateComment,
    deleteComment
}