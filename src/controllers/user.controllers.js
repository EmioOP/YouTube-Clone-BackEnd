import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)

        if (!user) {
            throw new ApiError(404, "User not found")
        }

        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Error while generating tokens")
    }
}

const registerUser = asyncHandler(async (req, res) => {

    const { username, fullName, email, password } = req.body

    if ([username, email, password, fullName].some(field => field?.trim() === "" || field?.trim() === undefined)) {
        console.log(username, email, password, fullName)
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne(
        {
            $or: [{ username }, { email }]
        })


    if (existedUser) {
        throw new ApiError(400, "User with same username or email already existing")
    }

    const avatarLocalPath = req.files?.avatar?.[0]?.path
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required")

    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if (!avatar) {
        throw new ApiError(500, "Error while uploading avatar")
    }
    const coverImage = coverImageLocalPath ? await uploadOnCloudinary(coverImageLocalPath) : ""


    try {
        const user = await User.create({
            username: username.toLowerCase(),
            fullName,
            email,
            password,
            avatar: avatar?.url,
            coverImage: coverImage?.url || ""
        })

        const createdUser = await User.findOne(user._id).select("-password -refreshToken")

        if (!createdUser) {
            throw new ApiError(500, "User creation failed")
        }

        return res
            .status(200)
            .json(
                new ApiResponse(200, createdUser, "User creation success")
            )
    } catch (error) {
        console.log("User creation failed")
        if (avatar) {
            await deleteFromColudinary(avatar.public_id)
        }
        if (coverImage) {
            await deleteFromColudinary(coverImage.public_id)
        }

        throw new ApiError(500, "User creation failed and images deleted")
    }

})

const loginUser = asyncHandler(async (req, res) => {

    //taking data from frontend
    const { username, email, password } = req.body

    // validation of front end data
    if (!email && !username) {
        throw new ApiError(400, "Username or email is required for login")
    }

    //check for the user with this username or email
    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "User not found")
    }

    //check for the passwored

    const checkPasswordCorrect = await user.isPasswordCorrect(password)

    if (!checkPasswordCorrect) {
        throw new ApiError(400, "Incorrect Password")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }


    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200,
                { user: loggedInUser, accessToken, refreshToken },
                "login success")
        )


})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken

    if (!incomingRefreshToken) {
        throw new ApiError(400, "Refresh token is required")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id)
        if (!user) {
            throw new ApiError(404, "Invalid Refresh Token")
        }
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(400, "Invalid refresh token ")
        }

        //generate new access token

        const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(user._id)

        const options = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production"
        }

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(200, { accessToken, newRefreshToken }, "access token refreshed")
            )
    } catch (error) {
        throw new ApiError(401, "Invalid refresh token")
    }


})

const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        })

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production"
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "logout success")
        )
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body

    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Old password and new Password are frequired")
    }

    const user = await User.findById(req.user?._id)

    if (!user) {
        throw new ApiError(400, "User not found")

    }

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "incorrect password")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "Password is changed successfully")
        )


})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(
            new ApiResponse(200, req.user, "User fetched")
        )
})

const updateAccontDetails = asyncHandler(async (req, res) => {
    const { username, fullName, email } = req.body

    if ([username, fullName, email].some(field => field.trim() === "" || field === undefined)) {
        throw new ApiError(400, "All fields are required")
    }

    if (username !== req.user.username) {
        const existedUser = await User.findOne({ username })
        if (existedUser) {
            throw new ApiError(400, "Username Already taken")
        }
    }
    if (email !== req.user.email) {
        const existedUser = await User.findOne({ email })
        if (existedUser) {
            throw new ApiError(400, "Email Already taken")
        }
    }

    const user = await User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                username: username.toLowerCase(),
                email,
                fullName
            }

        },
        {
            new: true
        }).select("-password -refreshToken")

    if (!user) {
        throw new ApiError(500, "Error while updating user informations")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "User informations updated")
        )
})

const changeUserAvatar = asyncHandler(async (req, res) => {


    const avatarLocalPath = req.file?.path


    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)


    if (!avatar.url) {
        throw new ApiError(500, "Error while uploading avatar")
    }
    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                avatar: avatar?.url
            }
        },
        {
            new: true
        }).select("-password -refreshToken")

    if (!user) {
        throw new ApiError(500, "Error while updating user avatar")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "User Avatar changed successfully")
        )

})

const changeUserCoverImage = asyncHandler(async (req, res) => {


    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        throw new ApiError(400, "CoverImage is required")
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if (!coverImage.url) {
        throw new ApiError(500, "Error while uploading coverImage")
    }
    const user = await User.findByIdAndUpdate(req.user?._id,
        {
            $set: {
                coverImage: coverImage?.url
            }
        },
        {
            new: true
        }).select("-password -refreshToken")

    if (!user) {
        throw new ApiError(500, "Error while updating user coverImage")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "User Cover Image changed successfully")
        )

})

const getUserChannelProfile = asyncHandler(async (req, res) => {
    const { username } = req.params


    if (!username?.trim()) {
        throw new ApiError(400, "Username is required")
    }


    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscriberCount: { $size: "$subscribers" },
                channelSubscribedToCount: { $size: "$subscribedTo" },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }

                }
            }
        },
        {
            //adds only neccesery data
            $project: {
                fullName: 1,
                username: 1,
                avatar: 1,
                subscriberCount: 1,
                channelSubscribedToCount: 1,
                isSubscribed: 1,
                coverImage: 1
            }
        }
    ])



    if (!channel?.length) {
        throw new ApiError(404, "channel not found")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, channel[0], "Channel details fetched")
        )
})

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user?._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }

                        }
                    }
                ]

            }
        }
    ])

    if (!user?.length) {
        throw new ApiError(404, "watch history not fetched")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, user[0]?.watchHistory, "watch history fetched")
        )
})


export {
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser,
    changeCurrentPassword,
    getCurrentUser,
    updateAccontDetails,
    changeUserAvatar,
    changeUserCoverImage,
    getUserChannelProfile,
    getWatchHistory
}