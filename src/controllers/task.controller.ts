import { asyncHandler } from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import { Request,Response } from "express";
import { Task } from "../models/task.model";
import { User } from "../models/user.model";
import { ObjectId, Types } from "mongoose";
import { Subtask } from "../models/subtask.model";

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
const updateTaskTitleById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params; // Get the task ID from the URL parameters
    const { title } = req.body;
    if(!id) {
        throw new ApiError(400,"invalid request")
    }
    if (!title) {
        throw new ApiError(400, "Title is required");
    }

    const updatedTask = await Task.findByIdAndUpdate(
        id,
        { title: title },
        { new: true }
    )

    if (!updatedTask) {
        throw new ApiError(404, "Task not found");
    }

    return res.status(200).json(
        new ApiResponse(200, "Task title updated successfully", updatedTask)
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

    const updatedTask = await Task.findByIdAndUpdate(
        id,
        { description:description },
        { new: true }
    )

    if (!updatedTask) {
        throw new ApiError(404, "Task not found");
    }

    return res.status(200).json(
        new ApiResponse(200, "Task description updated successfully", updatedTask)
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

    const updatedTask = await Task.findByIdAndUpdate(
        id,
        { priority:priority },
        { new: true }
    )

    if (!updatedTask) {
        throw new ApiError(404, "Task not found");
    }

    return res.status(200).json(
        new ApiResponse(200, "Task priority updated successfully", updatedTask)
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

    const updatedTask = await Task.findByIdAndUpdate(
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
        throw new ApiError(400, 'Task ID is required');
    }

    const task = await Task.findById(id);
    if (!task) {
        throw new ApiError(404, 'Task not found');
    }

    const user = await User.findOne({ username }).select('-password -refreshToken -id');
    if (!user) {
        throw new ApiError(404, 'User with this username does not exist');
    }

    // Check if the task is already assigned to the user
    if (task.assignedTo?.includes(user._id as Types.ObjectId) || user.tasks.includes(task._id as Types.ObjectId)) {
        throw new ApiError(400, 'User is already assigned to this task');
    }

    // Assign the task to the user
    task.assignedTo?.push(user._id as Types.ObjectId);
    user.tasks.push(task._id as Types.ObjectId);


    await user.save({ validateBeforeSave: false });
    await task.save();

    return res.status(200).json(new ApiResponse(200, 'Task successfully assigned to user', user));
});

const createSubTask = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params; // This is the parent task ID
    const { title, description, priority, status } = req.body;
    
    const task = await Task.findById(id);
    if (!task) {
        throw new ApiError(404, "Task not found");
    }
    
    const newSubTask = await Subtask.create({
        title,
        description,
        priority,
        status,
        task: task._id // Reference to the parent task
    });
    
    if (!newSubTask) {
        throw new ApiError(500, "Unable to create subtask");
    }
    
    // No need to check if subtask already exists, as we're creating a new one
    task.subTasks = task.subTasks || [];
    task.subTasks.push(newSubTask._id as Types.ObjectId);
    await task.save();
    
    return res.status(201).json(new ApiResponse(201, "Subtask created successfully", newSubTask));
});


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

const getAllSubtasksById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    if (!id) {
        throw new ApiError(400, "Task ID is required");
    }

    if (!Types.ObjectId.isValid(id)) {
        throw new ApiError(400, "Invalid task ID");
    }

    const task = await Task.findById(id);

    if (!task) {
        throw new ApiError(404, "Task not found");
    }

    const subtasks = await Subtask.find({ _id: { $in: task.subTasks } });

    if (subtasks.length === 0) {
        return res.status(200).json(new ApiResponse(200, "No subtasks found for this task", []));
    }

    return res.status(200).json(new ApiResponse(200, "Fetched all subtasks", subtasks));
});

export {createTask,deleteTaskById,updateTaskTitleById,updateTaskDescriptionById,updateTaskPriorityById,updateTaskStatusById,assignTaskTo,createSubTask,getAllSubtasksById};