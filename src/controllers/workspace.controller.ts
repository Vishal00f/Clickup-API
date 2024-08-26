import { Request, Response } from "express";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Workspace } from "../models/workspace.model";
import { User } from "../models/user.model";
import { Types } from "mongoose";

const createWorkspace = asyncHandler(async (req:Request,res:Response) => {
     const {name,description}= req.body
    if(!name){
        throw new ApiError(400,"name is required")
    }
    
    const newWorkspace = await Workspace.create({
        name,
        description,
        users:[req.user._id]
    })
    if(!newWorkspace){
        throw new ApiError(500,"Unable to create workspace at this moment");
    }       
    return res.status(200).json(new ApiResponse(200,"Workspace created succesfully",newWorkspace))

})
const updateName=asyncHandler(async (req:Request,res:Response) => {
    const {id}=req.params
    const {newName}=req.body
    if(!id){
        throw new ApiError(404,"unable to find workspace with this id")
    }
    const workspace = await Workspace.findByIdAndUpdate(id,{name:newName},{new:true})
    if(!workspace){
        throw new ApiError(500,"unable to update workspace name")
    }
    return res.status(200).json(new ApiResponse(200,"successfully changed workspace name",workspace))    
}) 
const updateDescription=asyncHandler(async (req:Request,res:Response) => {
    const {id}=req.params
    const {newDescription}=req.body
    if(!id){
        throw new ApiError(404,"unable to find workspace with this id")
    }
    const workspace = await Workspace.findByIdAndUpdate(id,{description:newDescription},{new:true})
    if(!workspace){
        throw new ApiError(500,"unable to update workspace description")
    }
    return res.status(200).json(new ApiResponse(200,"successfully changed workspace description",workspace))    
}) 
const addUserToWorkspace = asyncHandler(async (req:Request,res:Response) => {
    const {id} = req.params
    const {username}=req.body
    if(!id){
        throw new ApiError(404,"unable to find workspace with this id")
    }
    if(!username){
        throw new ApiError(400,"username is required")
    }
    const user =await User.findOne({username:username})
    if(!user){
        throw new ApiError(404,"user with this username not found")
    }
    const workspace = await Workspace.findById(id);
  if (!workspace) {
    throw new ApiError(404, "Unable to find workspace with this ID");
  }
   
      workspace.users?.push(user._id as Types.ObjectId);
    
      // Save the updated workspace
      await workspace.save();
    return res.status(200).json(new ApiResponse(200,"User added to workspace successfully",workspace))

})
export {createWorkspace,updateDescription,updateName,addUserToWorkspace}