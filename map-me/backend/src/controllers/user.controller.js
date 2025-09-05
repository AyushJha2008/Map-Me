import { asyncHandler } from "../utils/asyncHandler.js";
import {Apierr} from "../utils/api-err.js";
import {User} from "../models/user.model.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import { apiRes } from "../utils/apiRes.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";

const generateAccessandRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return {accessToken, refreshToken}

    } catch (error) {
        throw new Apierr(500, "something went wrong generating token")
    }
}

const registerUser = asyncHandler(async(req, res) =>{
    // get use detail from frontend
    // validation [check for empty input and correct format of inputed text]
    // check if user already exist: via email
    // requirement of file or img? [for avatar or cover image]
    // upload them to cloudinary for user fetching
    // create user object [contain userdata] - create entry in db
    // remove password and refresh token field in response
    // check for user creation - null or successfully created
    // return response

    //how to fetch response from user
    const {fullName, email, password, userName} = req.body
    //form ya json ka data body se mil jayega url ka nahi
    if([fullName, email, password, userName].some((field)=>
    field?.trim()==="")){
        throw new Apierr(400, "all field are required")
    }
    const existedUser = await User.findOne({
        $or: [{userName}, {email}]
    })    
    if(existedUser){throw new Apierr(409, "user already exist")}
    
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImgLocalPath = req.files?.coverImg[0]?.path;
    if(!avatarLocalPath){
        throw new Apierr(400, "Avatar required")
    }

    let coverImgLocalPath
    if(req.files && Array.isArray(req.files.coverImg)&& req.files.coverImg.length > 0){
        coverImgLocalPath = req.files?.coverImg[0].path;
    }
    const avatar = await uploadCloudinary(avatarLocalPath);
    const coverImg = await uploadCloudinary(coverImgLocalPath);
    if(!avatar){ throw new Apierr(409, "avatar required")}

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImg: coverImg?.url || "",
        email, password, 
        userName: userName?.toLowerCase().trim()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken "
    )
    console.log(createdUser); 
    if(!createdUser){
        throw new Apierr(500, "something went wrong while creating user")
    }
    return res.status(201).json(
        new apiRes(200, createdUser, "user registerd successfully")
    )
    
})

const loginUser = asyncHandler(async(req, res) => {
    // take input from user [email and username] from req body
    // check if empty field is not empty
    // username/email and password match karo database me
    // same raha toh uski data return karo
    // refresh & access token send in cookies
    // alag raha toh signup page pe return karo

    const {email, userName, password} = req.body
    if(!userName && !email){
        throw new Apierr(400, "username or password required")
    }
    const user = await User.findOne({$or:[{userName}, {email}]})
    if(!user){
        throw new Apierr(404, "user not exist")
    }
    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new Apierr(401, "Invalid Credentials")
    }
    const {accessToken, refreshToken} = await generateAccessandRefreshTokens(user._id)
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {   
        httpOnly: true,
        secure: true
    }
    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json( new apiRes(200,{user: loggedInUser, accessToken, refreshToken}, "user logged in"))
})

const loggedOutUser = asyncHandler(async(req, res) => {
    // remove refresh token / reset
    // cookies clear
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {refreshToken: undefined}
        },
        {new: true}
    )
    const options = {
        httpOnly: true,
        secure: true
    }
    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options).json(new apiRes(200,{}, "user logged out"))
})

const refreshAccessToken = asyncHandler(async(req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
     // 1st condn for dekstop || 2nd condn for mobile
    if(!incomingRefreshToken){
        throw new Apierr(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)
        // jwt encoded rehta hai usko decode karne ke liye token secret dena padta hai jwt.verify ko
        const user = await User.findById(decodedToken?._id)
    
        if(!user){
            throw new Apierr(401, "invlid refresh token")
        }
        
        if(incomingRefreshToken !== user?.refreshToken){
            throw new Apierr(401, "invalid or expired refresh token")
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken, newRefreshToken} = await generateAccessandRefreshTokens(user._id)
        return res.status(200)
        .cookie("accessToken", accessToken)
        .cookie("refreshToken", newRefreshToken)
        .json(
            new apiRes(
                200, {accessToken, refreshToken: newRefreshToken},
                "Access token refreshed"
            )
        )
    } catch (error) {
        throw new Apierr(401, error?.message || "invalid refresh token")
    }
})

const changeCurrentPassword = asyncHandler(async(req, res) => {
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new Apierr(400, "invalid old password")
    }
    user.password = newPassword
    await user.save({validateBeforeSave: false})
    return res.status(200)
    .json(new apiRes(200, {}, "password changed"))
})

const getCurrentUser = asyncHandler(async(req, res) => {
    return res.status(200).json(new apiRes(200, req.user, "current user fetched"))
})

const updateAccountDetails = asyncHandler(async(req, res) => {
    const {fullName, email} = req.body
    if(!fullName || !email){
        throw new Apierr(400, "All fields are required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id, {    
            $set: {
                fullName, email
            }
        },{new: true}
    ).select("-password")

    return res.status(200)
    .json(new apiRes(200, user, "details updated successfully"))
})

const updateUserAvatar = asyncHandler(async(req, res) => {
    const avatarLocalPath = req.files?.path
    if(!avatarLocalPath){
        throw new Apierr(400, "avatar is missing")
    }

    const avatar = await uploadCloudinary(avatarLocalPath)
    if(!avatar.url){
        throw new Apierr(400, "error while uploading on avatar")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{avatar: avatar.url}
        },
        {new: true}
    ).select("-password")


    return res.status(200)
    .json(new apiRes(200, "user avatar updated successfully"))
})

const updateUserCoverImg = asyncHandler(async(req, res) => {
    const coverImgLocalPath = req.files?.path
    if(!coverImgLocalPath){
        throw new Apierr(400, "cover Image is missing")
    }

    const coverImg = await uploadCloudinary(coverImgLocalPath)
    if(!coverImg.url){
        throw new Apierr(400, "error while uploading on coverImg")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{coverImg: coverImg.url}
        },
        {new: true}
    ).select("-password")

    return res.status(200)
    .json(new apiRes(200, "user avatar updated successfully"))
})

const getUserChannelProfile = asyncHandler(async(req,res) => {
    const {username} = req.params
    if(!username?.trim()){
        throw new Apierr(400, "username is missing");
    }
    const channel = await User.aggregate([
        {
            $match:{
                username: true?.toLowerCase()
            }
        },
        {
            $lookup: {
                from:"subscription",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from:"subscription",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscribedTo"            
            }
        },
        {
            $addFields: {
                subscriberCounts:{
                    $size: "$subscribers"
                },
                channelSubscribedToCount: {
                    $size: "$subscribedTo"
                },
                isSubscribed:{
                    $cond:{
                        if: {$in: [req.user?._id, "$subscriber.subscriber"]},
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscriberCounts: 1,
                channelSubscribedToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                email: 1,
                coverImg: 1
            }
        }
    ])

    if(!channel?.length){
        throw new Apierr(404, "channel does not exist")
    }
    return res.status(200).json(new apiRes(200, channel[0], "user channnel fetched successfully"))
})

const getWatchHistory = asyncHandler(async(req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId
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
                        $lookup:{
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
                        $addFields:{
                            owner:{
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res.status(200).json(
        new apiRes(200, user[0].watchHistory, "watch history fetched successfully")
    )
})

export {
    registerUser, loginUser, 
    loggedOutUser, refreshAccessToken, 
    changeCurrentPassword, getCurrentUser,
    updateAccountDetails, updateUserAvatar,
    updateUserCoverImg, getUserChannelProfile,
    getWatchHistory
}