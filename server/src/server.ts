import mongoose from "mongoose";import app from "./app.js";import {env} from "./config/env.js";
try{
 await mongoose.connect(env.MONGODB_URI);
 app.listen(env.PORT,()=>console.log(`AI Mystery Room API listening on ${env.PORT}`));
}catch(error){
 console.error("MongoDB is unavailable. Start MongoDB locally or set MONGODB_URI in the repository root .env file, then restart the API.");
 const failure=error as {name?:string;code?:string;reason?:{servers?:Map<string,{error?:{name?:string;code?:string}}>}};
 console.error(`Connection detail: ${failure.name||"unknown"}${failure.code?` (${failure.code})`:""}`);
 for(const [address,server] of failure.reason?.servers||[])console.error(`${address}: ${server.error?.code||server.error?.name||"unavailable"}`);
 process.exit(1);
}
