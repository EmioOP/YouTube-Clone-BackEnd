import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Video } from "../models/video.models.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { deleteFromColudinary, uploadOnCloudinary } from "../utils/cloudinary.js"
import { isValidObjectId } from "mongoose"


const publishVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    if (!title || !description) {
        throw new ApiError(400, "title and description are required")
    }

    const videoFileLocalPath = req.files?.videoFile?.[0]?.path
    if (!videoFileLocalPath) {
        throw new ApiError("video file is required")
    }

    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "thumbnail file is required")
    }

    const videoFile = await uploadOnCloudinary(videoFileLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)

    const video = await Video.create({
        videoFile: videoFile,
        thumbnail: thumbnail,
        title,
        description: description,
        views: 0,
        duration: videoFile.duration,
        isPublished: true,
        owner: req.user?._id
    })

    //may be get the video from database to ensure correct upload todo

    return res
        .status(200)
        .json(
            new ApiResponse(200, video, "Video published SuccessFully")
        )
})

const getVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "invalid videoId")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(500, "unable to fetch video")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, video, "Video fetched successfully")
        )
})

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query

    const currentPage = Number(page)
    const perPage = Number(limit)

    const skip = (currentPage - 1) * perPage

    const filter = {}

    if (query) {
        filter.title = { $regex: query, $options: "i" } //for searching without case sensitive
    }

    if (userId) {
        filter.own = userId
    }

    const sortOptions = {}
    sortOptions[sortBy] = sortType === "asc" ? 1 : -1


    const videos = await Video
        .find(filter)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)

    if(videos.length === 0){
        throw new ApiError(404,"No videos Found")
    }

    if(!videos){
        throw new ApiError(500,"Unable to fetch videos")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,videos,"Video fetched successfully")
    )

})

const updateVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video id")
    }

    const video = await Video.findById(videoId)

    if (video.owner !== req.user._id) {
        throw new ApiError(400, "Invalid request, no permission for this")
    }

    video.title = title
    video.description = description
    const updatedVideo = await video.save()

    return res
        .status(200)
        .json(
            new ApiResponse(200, updateVideo, "video updated successfully")
        )

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "invalid video id")
    }

    const video = await Video.findById(videoId)

    if (!video || video.owner !== req.user._id) {
        throw new ApiError(400, "Invalid request")
    }

    try {
        if (video.videoFile?.public_id) {
            await deleteFromColudinary(video.videoFile.public_id)
        }
        if (video.thumbnail?.public_id) {
            await deleteFromColudinary(video.thumbnail.public_id)
        }

        const deletedVideo = await Video.findByIdAndDelete(videoId)

        return res
            .status(200)
            .json(
                new ApiResponse(200, deletedVideo, "video deleted successfully")
            )

    } catch (error) {
        console.error(error)
        throw new ApiError(500, "unable to delete video")
    }

})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params


    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "invalid video id")
    }

    const video = await Video.findById(videoId)

    if (video.owner !== req.user?._id) {
        throw new ApiError(400, "you are not authorised to do this")
    }

    video.isPublished = !video.isPublished
    const updatedVideo = await video.save()

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedVideo, `video published status toggled to: ${updateVideo.isPublished}`)
        )

})

export {
    publishVideo,
    getVideo,
    getAllVideos,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}