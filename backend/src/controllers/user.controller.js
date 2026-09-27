import {asyncHandler} from "../utils/asycHandler.js"
import { ApiError } from "../utils/apiError.js";
import {User} from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

//function to generate Access token & Refresh token.
const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong, While generating access and refresh token!")
    }
}



// const registerUser = asyncHandler(async (req, res) => {

//     res.status(200).json({
//         status: "success",
//         message: "User registered successfully"
//     })  

// })

const registerUser = asyncHandler( async (req, res)=>
    {
    /*
    steps/algorithms:-
    1. get user details from user
    2. validation- not empty
    3. Check if user already exists: by username and email
    4. check for cover imgs  
    5. check for avatar
    6. upload them to cloudinary, avatar
    7. create user object - create entry in db
    8. Remove password and refresh tokken fields from the response
    9. check for user creation
    10. return response
       */

    const {fullName, email, userName, password, house} = req.body
    //   console.log("email:", email);

    //   if (fullName === "") {
    //     throw new ApiError(400, "full name is required")
    //   }

    if (
        [fullName, email, userName, password].some((field)=> field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const allowedHouses = ["stark", "lannister", "targaryen", "baratheon", "greyjoy", "tyrell", "martell", "arryn"]
    const swornHouse = house?.toLowerCase() || "stark"

    if (!allowedHouses.includes(swornHouse)) {
        throw new ApiError(400, "Invalid house selected")
    }
    const existedUser =  await User.findOne({
        $or: [{userName },{ email }]
    })

    if (existedUser) {
        throw new ApiError(409,"User with email or userName already exists")
    }

const avatarLocalPath = req.files?.avatar?.[0]?.path
//   const coverImgLocalPath = req.files?.coverImg?.[0]?.path

    let coverImgLocalPath;
    if (req.files && Array.isArray(req.files.coverImg) && req.files.coverImg.length >0 ) {
        coverImgLocalPath = req.files.coverImg[0].path
    }


if (!avatarLocalPath) {
    throw new ApiError(400,"avatar file is required")
}

const avatar = await uploadOnCloudinary(avatarLocalPath)
const coverImg = await uploadOnCloudinary(coverImgLocalPath)

if (!avatar) {
    throw  new ApiError(409, "Avatar  file is required")
}

const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImg: coverImg?.url || "",
    email,
    password,
    house: swornHouse,
    userName: userName.toLowerCase()
})

const createduser =  await User.findById(user._id).select(
    "-password -refreshToken"
)

if (!createduser) {
    throw new ApiError(500, "Smething went wrong while regestering user")
}

return res.status(201).json(
    new ApiResponse(200, createduser, "User Created Successfully")
)

}
)

const loginUser = asyncHandler( async (req, res) => {
    /*
    steps/algorithms:-
    1. req.body -> data
    2. username or email
    3. find the user
    4. check the password
    5. access and refresh token
    6. send tokens in cookies 
    */

    const {email, password, userName} = req.body

    // if (!userName && !email) {
    //     throw new ApiError(400,"userName or email is required")
    // }
    if (!(userName || email)) {
        throw new ApiError(400,"userName or email is required")
    }

   const user = await User.findOne({
        $or: [{userName}, {email}]
    })

    if (!user) {
        throw new ApiError(404, "User doesn`t exists")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Password invalid!!!!")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshToken(user._id)

   const loggedInUser =  await User.findById(user._id).select("-password -refeshToken")

   const options = {
    httpOnly: true,
    secure: true,

   }


   return res
   .status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refreshToken",refreshToken, options)
   .json(
    new ApiResponse(
        200,
        {
            user: loggedInUser, accessToken, refreshToken
        },
        "User Logged in Successfully"
         )
    )



})

const logoutUser = asyncHandler(async (req, res) => {
    await  User.findByIdAndUpdate(
        req.user._id, 
        {
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )

    const options = {
    httpOnly: true,
    secure: true,

                    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged out Successfully"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incommingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incommingRefreshToken) {
        throw new ApiError((401, "Unauthorised Request"))
    }

    try {
        const decodedToken = jwt.verify(incommingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
       const user = await User.findById(decodedToken?._id)
    
       if (!user) {
        throw new ApiError(401, "Invalid refresh token")
       }
    
       if (incommingRefreshToken !== user?.refreshToken) {
        throw new ApiError(401, "Refresh token is expired or used")
       }
    
      const options = {
        httpOnly: true,
        secure: true
      }
     
      const {accessToken, newRefreshToken} = await generateAccessAndRefreshToken(user._id)
    
      return res.status(200)
      .cookie('accessToken', accessToken, options)
      .cookie("refreshToken", newRefreshTokenefreshToken, options)
      .json(
        new ApiResponse(
            200,
            {
                accessToken,
                newRefreshToken
            },
            "Access token refreshed Successfuly"
        )
      )
    } catch (error) {
        throw new ApiError(401, error.message ,"Invalid refresh token")
    }

})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const {oldPassword, newPassword} = req.body

   const user = await User.findById(req.user?._id)
   const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

   if (!isPasswordCorrect) {
    throw new ApiError(400, "Invalid Password")
   }

   user.password = newPassword
   await use.save({validateBeforeSave: false})

   return res
   .status(200)
   .json(new ApiResponse(200, {}, "Password Change successfully"))
})

const getCurrentUser = asyncHandler(async (req, res) => {
    return res
    .status(200)
    .json(200, req.user, "Current User fetched successfully")
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const {fullName, email} = req.body

    if (!fullName || !email) {
        throw new ApiError(400, "All fields are required")
    }

  const user =  User.findByIdAndUpdate(
    req.user?._id,
     {
        $set:
        {
            fullName, email
        }
    },
    {
        new: true
    }
)
.select(
    "-password"
)

    return res
    .status(200)
    .json(new ApiResponse(200, "Account details Updated"))

})

const updateUserAvatar = asyncHandler(async (req, res) => {
   const avatarLocalFile =  req.file?.path

   if (!avatarLocalFile) {
    throw new ApiError(400,"Avatar file is missing")
   }

   const avatar = await uploadOnCloudinary(avatarLocalFile)

    if (!avatar) {
    throw new ApiError(400,"error while uploading on avatar in cloudinary")
   }


   const user = await User.findByIdAndUpdate(
    req.user?._id,

    {
        $set: {
            avatar: avatar.url
        }
    },
    {
        new: true
    }
   ).select("-password")
    return res
    .status(200)
    .json(
        new ApiResponse(200, user, "Avatar Image updated successfully")
    )



})

const updateUserCoverImg = asyncHandler(async (req, res) => {
   const coverImgLocalFile =  req.file?.path

   if (!coverImgLocalFile) {
    throw new ApiError(400,"Avatar file is missing")
   }

   const coverImg = await uploadOnCloudinary(coverImgLocalFile)

    if (!avatar) {
    throw new ApiError(400,"error while uploading on avatar in cloudinary")
   }


   const user= await User.findByIdAndUpdate(
    req.user?._id,

    {
        $set: {
            coverImg: coverImg.url
        }
    },
    {
        new: true
    }
   ).select("-password")

   return res
   .status(200)
   .json(
    new ApiResponse(200, user, "Cover Image updated successfully")
   )

})

const getUserChannelProfile = asyncHandler( async (req,res) =>
     {
  
        const {userName} = req.params

        if (!userName?.trim) {
            throw new ApiError(400, "UserName is missing")
        }

      const channel =  await User.aggregate([
        {
            $match: {
                userName: userName?.toLowerCase()
            }
        },
        {
            $lookup: {
                from: "Subscription",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "Subscription",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                channelsSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed: {
                    $condition: {
                        if: {$in: [req.user?._id, "$subscribers.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                userName: 1,
                subscribersCount: 1,
                channelsSubscribedToCount: 1,
                isSubscribed:1,
                avatar: 1,
                coverImg: 1,
                email:1,
                house:1,

            }
        }
      ])

      if (!channel?.length) {
        throw new ApiError(404, "Channel Does`nt exists")
      }
      
      return res
      .status(200)
      .json(
        new ApiResponse(200, channel[0], "UserChannel Fetched Successfully")
      )

})

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField:"_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField:"owner",
                            foreignField:"_id",
                            as: "owner",
                            pipeline: [
                                {
                                    project: {
                                        fullName: 1,
                                        userName: 1,
                                        avatar: 1,
                                        house: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields:{
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory, "watch history fetch successfully"
        )
    )

})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser, 
    updateAccountDetails, 
    updateUserAvatar,
    updateUserCoverImg,
    getUserChannelProfile,
    getWatchHistory
}