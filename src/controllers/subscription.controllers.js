import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import mongoose, { isValidObjectId } from "mongoose";
import { Subscription } from "../models/subscription.models.js"

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "invalid channel id")
    }

    const isSubscribed = await Subscription.findOne({
        channel: channelId,
        subscriber: req.user?._id
    })

    if (isSubscribed) {
        const unsubscribe = await Subscription.findByIdAndDelete(isSubscribed._id)

        if(!unsubscribe){
            throw new ApiError(400,"Unable to add subscription")
        }

        return res.status(200).json(new ApiResponse(200, unsubscribe, "Subscription removed successfully"))
    } else {
        const subscribe = await Subscription.create({
            channel:channelId,
            subscriber:req.user?._id
        })

        if(!subscribe){
            throw new ApiError(400,"Unable to add subscription")
        }

        return res.status(200).json(new ApiResponse(200, subscribe, "Subscription added successfully"))
    }

})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "invalid channel id")
    }

    const subscribersList = await Subscription.aggregate([
        {
            $match:{
                channel:new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"subscriber",
                foreignField:"_id",
                as:"subcriber"
            }
        },
        {
            $unwind:"$subscriber"
        },
        {
            $project:{
                subscriber:{
                    _id:1,
                    username:1,
                    fullName:1,
                    avatar:1
                }
            }
        }

        
    ])

    if(!subscribersList.length){
        throw new ApiError(400,"unable to find subscriber list")
    }

    const subscriberInfo = {
        subscribers:subscribersList || [],
        subscribersCount:subscribersList.length || 0
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200,subscriberInfo,"subscribers fetched successfully")
    )


})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "invalid channel id")
    }

    const subscribedToList = await Subscription.aggregate([
        {
            $match:{
                subscriber:new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"channel",
                foreignField:"_id",
                as:"channel"
            }
        },
        {
            $unwind:"$channel"
        },
        {
            $project:{
                channel:{
                    _id:1,
                    username:1,
                    fullName:1,
                    avatar:1
                }
            }
        }

        
    ])

    if(!subscribedToList.length){
        throw new ApiError(400,"unable to find channel list")
    }


    const subscribedToInfo = {
        channels:subscribedToList || [],
        channelCounts:subscribedToList.length || 0
    }


    return res
    .status(200)
    .json(
        new ApiResponse(200,subscribedToInfo,"subscribers fetched successfully")
    )


})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}