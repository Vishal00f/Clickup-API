import mongoose,{Schema,Document} from "mongoose";

interface ITask extends Document{
    
    title:string,
    description?:string,
    priority?:'low' | 'normal' | 'high' | 'urgent',
    status?:"to-do"|"in-progress"|"done"|"in-review"|"develop"|"pre-production"|"in-testing",
    assignedTo?:mongoose.Types.ObjectId[],
    subTasks?:mongoose.Types.ObjectId[],
    category:"task"
}
const taskSchema = new Schema<ITask>({
    title:{
        type:String,
        required:true,
    },
    description:{
        type:String,
    },
    priority:{
      type:String,
      enum:["low","normal","high","urgent"],
      default:"normal"  
    },
    status:{
        type:String,
        enum:["to-do","in-progress","done","in-review","develop","pre-production","in-testing"],
        default:"to-do"
    },
    assignedTo:{
        type:[mongoose.Types.ObjectId],
        ref:"User",
        default:[]
    },
    subTasks:{
        type:[mongoose.Types.ObjectId],
        ref:"SubTask",
        default:[]
    },
    category:{
        type:String,
        default:"task"
    }
})
export const Task=mongoose.model<ITask>("Task",taskSchema)