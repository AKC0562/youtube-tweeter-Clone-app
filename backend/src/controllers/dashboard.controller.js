import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asycHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    const userId = req.user?._id

    const totalVideos = await Video.countDocuments({owner: userId})

    const totalViews = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $group: {
                _id: null,
                totalViews: {
                    $sum: "$views"
                }
            }
        }
    ])

    const totalSubscribers = await Subscription.countDocuments({channel: userId})

    const totalLikes = await Like.aggregate([
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video"
            }
        },
        {
            $match: {
                "video.owner": new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $count: "totalLikes"
        }
    ])

    const channelStats = {
        totalVideos,
        totalViews: totalViews[0]?.totalViews || 0,
        totalSubscribers,
        totalLikes: totalLikes[0]?.totalLikes || 0
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, channelStats, "Channel stats fetched Successfully")
    )
})

const getChannelVideos = asyncHandler(async (req, res) => {
    const videos = await Video.find({owner: req.user?._id}).sort({createdAt: -1})

    return res
    .status(200)
    .json(
        new ApiResponse(200, videos, "Channel videos fetched Successfully")
    )
})

export {
    getChannelStats, 
    getChannelVideos
    }
