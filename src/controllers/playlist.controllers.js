import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.models.js"
import { Video } from "../models/video.models.js";


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    if (!name) {
        throw new ApiError(400, "playlist name is rewquired")
    }

    if (!req.user._id) {
        throw new ApiError(400, "Unauthorized request")
    }

    const playlist = await Playlist.create({
        owner: req.user._id,
        name,
        description
    })

    if (!playlist) {
        throw new ApiError(500, "unable to create playlist")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, playlist, "playlist created successfully")
        )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "invalid user id")
    }

    const playlists = await Playlist.find({
        owner: userId
    })

    if (!playlists) {
        throw new ApiError(500, "Unable to fetch user playlists")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, playlists, "user playlists fetched successfully")
        )


})

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "invalid playlist id")
    }

    const playlist = await Playlist.findById(playlistId).populate("videos")

    if (!playlist) {
        throw new ApiError(404, "playlist not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, playlist, "playlist fetched successfully")
        )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "invalid playlist id")
    }
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "invalid playlist id")
    }

    const playlist = await Playlist.findById(playlistId)

    if (!playlist) {
        throw new ApiError(404, "playlist not found")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "video not found")
    }

    if (playlist.owner !== req.user?._id) {
        throw new ApiError(400, "Unauthorized request")
    }

    playlist.videos.push(videoId)
    await playlist.save()

    return res
        .status(200)
        .json(
            new ApiResponse(200, playlist, "playlist fetched successfully")
        )
})

const removeVideoFromPlayList = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "invalid playlist or video Id")
    }

    const playlist = await Playlist.findOne({
        _id: playlistId,
        owner: req.user?._id
    })

    if (!playlist) {
        throw new ApiError(404, "Playlist not found")
    }

    const videoIndex = playlist.videos.findIndex((video) => video._id.toString() === videoId)

    if (videoIndex === -1) {
        throw new ApiError(404, "Video not found in playlist")
    }

    playlist.videos.splice(videoIndex, 1)
    const updatedPlaylist = await playlist.save()

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedPlaylist, "removed video from the playlist")
        )


})

const updatePlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    const { playlistId } = req.params

    const updateData = {}

    if (name) updateData.name = name
    if (description) updateData.description = description

    if (!name || typeof name !== "string") {
        throw new ApiError(400, "name is required and type must be string")
    }

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "invalid playlist id")
    }

    const updatedPlaylist = await Playlist.findOneAndUpdate({
        _id: playlistId,
        owner: req.user?._id
    },
        updateData,
        {
            new: true
        })

    if (!updatedPlaylist) {
        throw new ApiError(404, "playlist not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, updatedPlaylist, "Playlist updated")
        )


})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "invalid playlist id")
    }

    const deletedPlaylist = await Playlist.findOneAndDelete({
        _id: playlistId,
        owner: req.user?._id
    })

    if (!deletedPlaylist) {
        throw new ApiError(404, "unable to delete playlist")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, deletedPlaylist, "Playlist deleted")
        )


})


export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlayList,
    updatePlaylist,
    deletePlaylist
}