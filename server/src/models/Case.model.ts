import mongoose, {Schema} from "mongoose";
const caseSchema=new Schema({publicCase:{type:Schema.Types.Mixed,required:true},privateSolution:{type:Schema.Types.Mixed,required:true,select:false},ownerSessionHash:{type:String,required:true,index:true},status:{type:String,enum:["ready","accused","completed"],default:"ready"},accusation:{type:Schema.Types.Mixed,default:null},generationModel:{type:String,required:true},generationVersion:{type:String,default:"1.0"}},{timestamps:true});
caseSchema.index({createdAt:-1});
export const CaseModel=mongoose.models.Case||mongoose.model("Case",caseSchema);
