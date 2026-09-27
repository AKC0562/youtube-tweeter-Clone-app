import {ApiError} from "../utils/apiError.js"
import {ApiResponse} from "../utils/apiResponse.js"
import {asyncHandler} from "../utils/asycHandler.js"


const healthcheck = asyncHandler(async (req, res) => {
    return res
    .status(200)
    .json(
        new ApiResponse(200, {status: "OK"}, "Everything is OK")
    )
})

export {
    healthcheck
    }
