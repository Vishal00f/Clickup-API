import mongoose,{Schema,Document} from "mongoose";

interface ISubtask extends Document{
    title:string,
    description:string,
    priority:'low' | 'normal' | 'high' | 'urgent',
    status:"to-do"|"in-progress"|"done"|"in-review"|"develop"|"pre-production"|"in-testing",
    assignedTo:mongoose.Types.ObjectId[],
    subTasks:mongoose.Types.ObjectId[]
}
const subtaskSchema = new Schema<ISubtask>({
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
    }
})

export const Subtask = mongoose.model<ISubtask>("Subtask",subtaskSchema);