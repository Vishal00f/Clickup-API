import { asyncHandler } from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import { Request,Response } from "express";
import { Task } from "../models/task.model";

const createTask = asyncHandler(async (req:Request,res:Response)=>{
        const {title,description,priority,status,assignedTo,subTasks}=req.body
        if(!title ){
            throw new ApiError(400,"cannot fetch title for task");
        }
        const newTask =await Task.create({
            title:title,
            description:description,
            priority:priority,
            status:status,
            assignedTo:assignedTo,
            subTasks:subTasks
        })
        if(!newTask){
            throw new ApiError(400,"Error creating task");
        }
        console.log(newTask)
        return res.status(200).json(
            new ApiResponse(200,"Task created successfully",newTask)
        )
})
const deleteTaskById = asyncHandler(async (req:Request,res:Response)=>{
    const {id}= req.params;
    if(!id){
        throw new ApiError(404,"invalid request")
    }
    const task=await Task.findById(id);
    if(!task){
        throw new ApiError(404,"the task u want to delete is unable to delete")
    }
    await Task.findByIdAndDelete(id)
    return res.status(200).json(new ApiResponse(200,"task deleted successfully"))
})
export {createTask,deleteTaskById};