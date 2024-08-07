import mongoose,{Schema,Document} from "mongoose";
interface IWorkspace{
    workspaceProfile?:string,
    name:string,
    description?:string,
    users?:string
}
const WorkspaceSchema = new Schema<IWorkspace>({
    workspaceProfile:{
        type:String,
    },
    name:{
        type:String,
        required:true,
    },
    description:{
        type:String,
    },
    users:{
        type:[mongoose.Types.ObjectId],
        ref:"User",
        default:[]
    }

})
export const Workspace = mongoose.model<IWorkspace>("Workspace",WorkspaceSchema);