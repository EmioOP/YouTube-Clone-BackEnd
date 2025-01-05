import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { Video } from "../models/video.models.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"


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
        videoFile: videoFile?.url,
        thumbnail: thumbnail?.url,
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


export { publishVideo }