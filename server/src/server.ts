import app from "./app.js";import {env} from "./config/env.js";import {connectDatabase} from "./database.js";
async function start(){try{
 await connectDatabase();
 app.listen(env.PORT,()=>console.log(`AI Mystery Room API listening on ${env.PORT}`));
}catch(error){
 console.error("MongoDB is unavailable. Check that MONGODB_URI points to a reachable database and that its network access list permits this server.");
 const failure=error as {name?:string;code?:string;reason?:{servers?:Map<string,{error?:{name?:string;code?:string}}>}};
 console.error(`Connection detail: ${failure.name||"unknown"}${failure.code?` (${failure.code})`:""}`);
 for(const [address,server] of failure.reason?.servers||[])console.error(`${address}: ${server.error?.code||server.error?.name||"unavailable"}`);
 process.exit(1);
}}
void start();
