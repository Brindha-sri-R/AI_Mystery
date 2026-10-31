import type {CreateCaseInput,PublicCase,CaseResult} from "@mystery/shared";
const base=import.meta.env.VITE_API_BASE_URL||"/api/v1";
async function request<T>(path:string,init?:RequestInit):Promise<T>{
  const res=await fetch(`${base}${path}`,{...init,credentials:"include",headers:{"Content-Type":"application/json",...init?.headers}});
  const text=await res.text();
  let body:unknown;
  try{body=text?JSON.parse(text):null;}catch{
    if(!res.ok)throw new Error(res.status>=500?"The case service is temporarily unavailable. Please try again shortly.":"The server returned an unexpected response. Please try again.");
    throw new Error("The server returned an invalid response. Please try again.");
  }
  if(!res.ok){
    const message=(body as {error?:{message?:string}}|null)?.error?.message;
    throw new Error(message|| (res.status>=500?"The case service is temporarily unavailable. Please try again shortly.":"Unable to complete that request."));
  }
  if(body===null)throw new Error("The server returned an empty response. Please try again.");
  return body as T;
}
export const api={create:(input:CreateCaseInput)=>request<{case:PublicCase}>("/cases",{method:"POST",body:JSON.stringify(input)}),get:(id:string)=>request<{case:PublicCase;result?:CaseResult}>(`/cases/${id}`),accuse:(id:string,suspectId:string)=>request<{result:CaseResult}>(`/cases/${id}/accusation`,{method:"POST",body:JSON.stringify({suspectId})})};
