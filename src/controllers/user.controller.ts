import { asyncHandler } from "../utils/asyncHandler";
import ApiResponse from "../utils/ApiResponse";
import ApiError from "../utils/ApiError";
import { User } from "../models/user.model";
import { Request, Response } from "express";
import { Types } from "mongoose";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
interface AuthenticatedRequest extends Request {
    user: {
      _id: string;
      // Add other user properties as needed
    };
  }
  


const generateAccessAndRefreshToken = async(userId:any)=>{
    try {
        const user= await User.findById(userId)
        if(!user){
            throw new ApiError(401,"unauthorized access");
        }
        const accessToken =  user.generateAccessToken()
        const refreshToken =  user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({validateBeforeSave:false})
        return {accessToken,refreshToken};
    } catch (error) {
        throw new ApiError(500,"something went wrong while generating tokens")
    }
}
const registerUser = asyncHandler(async (req:Request,res:Response)=>{
    const {firstName,lastName,username,password,email}= req.body;
    if (
        [firstName, lastName,username, email, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }
    if (!firstName || !lastName || !username || !email || !password) {
        throw new ApiError(400, "All fields are required")
    }
    const existedUser = await User.findOne({
        $or:[{username},{email}]
    })
    if(existedUser){
        throw new ApiError(409,"user with this username or email already exists")
    }


    const user = await User.create({
        firstName,
        lastName,
        username,
        email,
        password
    })
    const createdUser = await User.findById(user._id).select('-password -refreshToken') 
    if(!createdUser){
        throw new ApiError(500,"something went wrong while register")
    }
    return res.status(200).json(new ApiResponse(200,"user created successfully",createdUser));
})
const loginUser= asyncHandler(async(req:Request,res:Response)=>{
    const {email,password,username}=req.body
    if(!email && !username){
        throw new ApiError(401,"Username or email is invalid");
    }
    const user= await User.findOne({
        $or:[{email},{username}]
    })
    if(!user){
        throw new ApiError(404,"user does not exist")
    }
    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401,"password is wrong")
    }
    const {accessToken,refreshToken}=await generateAccessAndRefreshToken(user._id)
    if(!accessToken || !refreshToken){
        throw new ApiError(404,"access generating tokens")
    }
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const options = {
        httpOnly:true,
        secure:false
    }
    return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options).json(new ApiResponse(200,"user loggedin successfully",{user:loggedInUser}))
})
const logOutUser = asyncHandler(async(req:AuthenticatedRequest,res:Response)=>{
    
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set:{
                refreshToken:undefined
            }
        },
        {
            new:true
        }
    )
    const options= {
        httpOnly:true,
        secure:false
    }
    return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options).json(new ApiResponse(200,"user logged out successfully",{}));
})
const changePassword = asyncHandler(async (req:Request,res:Response)=>{
    
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);
        const isPasswordCorrect = await user?.isPasswordCorrect(currentPassword)
    
        if (!isPasswordCorrect) {
            throw new ApiError(401,"Invalid old password");
        }
        if(user){
            user.password = newPassword;
            user?.save({ validateBeforeSave: false });
        }
    
        return res.status(200).json(new ApiResponse(200, "Password changed successfully"))
})
const getCurrentUser = asyncHandler(async (req:Request,res:Response) => {
    const user = await User.findById(req.user._id).select('-password -refreshToken')
    if(!user){
        throw new ApiError(404,"user not found unable to get user")
    }
    return res.status(200).json(new ApiResponse(200,"user fetched successfully",user))
})
const getUserTasks = asyncHandler(async (req: Request, res: Response) => {
    const userId = new Types.ObjectId(req.user._id);

    const userWithTasks = await User.aggregate([
        {
            $match: { _id: userId }
        },
        {
            $lookup: {
                from: 'tasks',
                localField: 'tasks',
                foreignField: '_id',
                as: 'tasks'
            }
        },
        {
            $unwind: '$tasks'
        },
        {
            $lookup: {
                from: 'users',
                localField: 'tasks.assignedTo',
                foreignField: '_id',
                as: 'tasks.assignedUsers'
            }
        },
        {
            $group: {
                _id: '$_id',
                username: { $first: '$username' },
                email: { $first: '$email' },
                tasks: { $push: '$tasks' }
            }
        },
        {
            $project: {
                _id: 1,
                username: 1,
                email: 1,
                tasks: {
                    $map: {
                        input: '$tasks',
                        as: 'task',
                        in: {
                            _id: '$$task._id',
                            title: '$$task.title',
                            description: '$$task.description',
                            assignedUsers: {
                                $map: {
                                    input: '$$task.assignedUsers',
                                    as: 'user',
                                    in: '$$user.username'
                                }
                            }
                        }
                    }
                }
            }
        }
    ]);

    if (!userWithTasks.length) {
        throw new ApiError(404, "User or tasks not found");
    }

    return res.status(200).json(new ApiResponse(200, "Fetched user's tasks", userWithTasks[0]));
});
const updateUsername = asyncHandler(async (req:Request,res:Response)=>{
    const { newUsername } = req.body;

    if (!newUsername || typeof newUsername !== 'string' || newUsername.trim() === '') {
        throw new ApiError(400, "Invalid username provided");
    }

    const user = await User.findById(req.user._id);
    if (!user) {
        throw new ApiError(401, "Unauthorized access, please login again");
    }

    if (user.username === newUsername) {
        return res.status(200).json(new ApiResponse(200, "Username is the same as current username"));
    }

    const isUserExists = await User.findOne({ username: newUsername });
    if (isUserExists) {
        throw new ApiError(409, "User with this username already exists");
    }

    user.username = newUsername;
    const updatedUser = await user.save({validateBeforeSave:false});

    if (!updatedUser) {
        throw new ApiError(500, "Unable to change username");
    }
    const userWithNewUsername= await User.findById(req.user._id).select('-password -refreshToken')
    if(!userWithNewUsername){
        throw new ApiError(404,"unable to fetch user")
    }
    return res.status(200).json(new ApiResponse(200, "Username changed successfully", userWithNewUsername));
})


const refreshAccessToken = asyncHandler(async (req:Request, res:Response) => {


    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken;
    if (!incomingRefreshToken) {
        throw new ApiError(401, "unauthorized access")
    }
    try {
        const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET as Secret) as JwtPayload

        const user = await User.findById(decodedToken?._id)
        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "refresh token is expired or used")
        }

        const { accessToken, refreshToken:newRefreshToken } =await generateAccessAndRefreshToken(user._id)
        const options = {
            httpOnly: true,
            secure: true
        }

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", newRefreshToken, options)
            .json(
                new ApiResponse(200, "Access Token refreshed",  { accessToken, refreshToken: newRefreshToken })
            )

    } catch (error) {
        throw new ApiError(401, "Invalid refresh token")
    }
})

export {registerUser,loginUser,logOutUser,changePassword,getCurrentUser,getUserTasks,updateUsername,refreshAccessToken};