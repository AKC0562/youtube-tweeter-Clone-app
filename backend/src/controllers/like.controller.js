import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {Video} from "../models/video.model.js"
import {Comment} from "../models/comment.model.js"
import {Tweet} from "../models/tweet.model.js"
import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asycHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    const video = await Video.findById(videoId)

    if (!video) {
        throw new ApiError(404, "Video doesn`t exists")
    }

    const existedLike = await Like.findOne({
        video: videoId,
        likedBy: req.user?._id
    })

    if (existedLike) {
        await Like.findByIdAndDelete(existedLike?._id)

        return res
        .status(200)
        .json(
            new ApiResponse(200, {isLiked: false}, "Video unliked Successfully")
        )
    }

    const like = await Like.create({
        video: videoId,
        likedBy: req.user?._id
    })

    return res
    .status(200)
    .json(
        new ApiResponse(200, like, "Video liked Successfully")
    )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment id")
    }

    const comment = await Comment.findById(commentId)

    if (!comment) {
        throw new ApiError(404, "Comment doesn`t exists")
    }

    const existedLike = await Like.findOne({
        comment: commentId,
        likedBy: req.user?._id
    })

    if (existedLike) {
        await Like.findByIdAndDelete(existedLike?._id)

        return res
        .status(200)
        .json(
            new ApiResponse(200, {isLiked: false}, "Comment unliked Successfully")
        )
    }

    const like = await Like.create({
        comment: commentId,
        likedBy: req.user?._id
    })

    return res
    .status(200)
    .json(
        new ApiResponse(200, like, "Comment liked Successfully")
    )
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id")
    }

    const tweet = await Tweet.findById(tweetId)

    if (!tweet) {
        throw new ApiError(404, "Tweet doesn`t exists")
    }

    const existedLike = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user?._id
    })

    if (existedLike) {
        await Like.findByIdAndDelete(existedLike?._id)

        return res
        .status(200)
        .json(
            new ApiResponse(200, {isLiked: false}, "Tweet unliked Successfully")
        )
    }

    const like = await Like.create({
        tweet: tweetId,
        likedBy: req.user?._id
    })

    return res
    .status(200)
    .json(
        new ApiResponse(200, like, "Tweet liked Successfully")
    )
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    const likedVideos = await Like.aggregate([
        {
            $match: {
                likedBy: new mongoose.Types.ObjectId(req.user?._id),
                video: {$exists: true, $ne: null}
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "video",
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
                                        userName: 1,
                                        fullName: 1,
                                        avatar: 1,
                                        house: 1
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
        },
        {
            $addFields: {
                video: {
                    $first: "$video"
                }
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(200, likedVideos, "Liked videos fetched Successfully")
    )
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}
