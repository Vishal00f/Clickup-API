import { Request, Response } from "express";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { Types } from "mongoose";
import { Subtask } from "../models/subtask.model";
import { User } from "../models/user.model";

const updateTaskTitleById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params; // Get the task ID from the URL parameters
    const { title } = req.body;
    if(!id) {
        throw new ApiError(400,"invalid request")
    }
    if (!title) {
        throw new ApiError(400, "Title is required");
    }

    const updatedTask = await Subtask.findByIdAndUpdate(
        id,
        { title: title },
        { new: true }
    )

    if (!updatedTask) {
        throw new ApiError(404, "Task not found");
    }

    return res.status(200).json(
        new ApiResponse(200, "subtask title updated successfully", updatedTask)
    );
});
const updateTaskDescriptionById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params; // Get the task ID from the URL parameters
    if(!id) {
        throw new ApiError(400,"invalid request")
    }
    const { description } = req.body;

    if (!description) {
        throw new ApiError(400, "Title is required");
    }

    const updatedTask = await Subtask.findByIdAndUpdate(
        id,
        { description:description },
        { new: true }
    )

    if (!updatedTask) {
        throw new ApiError(404, "Task not found");
    }

    return res.status(200).json(
        new ApiResponse(200, "subTask description updated successfully", updatedTask)
    );
});
const updateTaskPriorityById = asyncHandler(async (req:Request,res:Response)=>{
    const { id } = req.params; // Get the task ID from the URL parameters
    if(!id) {
        throw new ApiError(400,"invalid request")
    }
    const { priority } = req.body;

    if (!priority) {
        throw new ApiError(400, "Title is required");
    }

    const updatedTask = await Subtask.findByIdAndUpdate(
        id,
        { priority:priority },
        { new: true }
    )

    if (!updatedTask) {
        throw new ApiError(404, "subtask not found");
    }

    return res.status(200).json(
        new ApiResponse(200, "subtask priority updated successfully", updatedTask)
    );
})
const updateTaskStatusById = asyncHandler(async (req:Request,res:Response)=>{
    const { id } = req.params; // Get the task ID from the URL parameters
    if(!id) {
        throw new ApiError(400,"invalid request")
    }
    const { status } = req.body;

    if (!status) {
        throw new ApiError(400, "Title is required");
    }

    const updatedTask = await Subtask.findByIdAndUpdate(
        id,
        { status:status },
        { new: true }
    )

    if (!updatedTask) {
        throw new ApiError(404, "Task not found");
    }

    return res.status(200).json(
        new ApiResponse(200, "Task status updated successfully", updatedTask)
    );
})
const assignTaskTo = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { username } = req.body;

    if (!username) {
        throw new ApiError(400, 'Username is required');
    }
    if (!id) {
        throw new ApiError(400, 'subTask ID is required');
    }

    const subtask = await Subtask.findById(id);
    if (!subtask) {
        throw new ApiError(404, 'subTask not found');
    }

    const user = await User.findOne({ username }).select('-password -refreshToken -id');
    if (!user) {
        throw new ApiError(404, 'User with this username does not exist');
    }

    // Check if the task is already assigned to the user
    if (subtask.assignedTo?.includes(user._id as Types.ObjectId) ) {
        throw new ApiError(400, 'User is already assigned to this task');
    }

    // Assign the task to the user
    subtask.assignedTo?.push(user._id as Types.ObjectId);
    user.tasks.push(subtask._id as Types.ObjectId);

    await user.save({ validateBeforeSave: false });
    await subtask.save();

    return res.status(200).json(new ApiResponse(200, 'Task successfully assigned to user', subtask));
});



const deleteTaskById = asyncHandler(async (req:Request,res:Response)=>{
    const {id}= req.params;
    if(!id){
        throw new ApiError(404,"invalid request")
    }
    const task=await Subtask.findById(id);
    if(!task){
        throw new ApiError(404,"the task u want to delete is unable to delete")
    }
    await Subtask.findByIdAndDelete(id)
    return res.status(200).json(new ApiResponse(200,"task deleted successfully"))
})
export {updateTaskTitleById,updateTaskDescriptionById,updateTaskPriorityById,updateTaskStatusById,deleteTaskById,assignTaskTo};