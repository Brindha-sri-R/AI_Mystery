import {GoogleGenAI,ThinkingLevel} from "@google/genai";
import {generationSchema, type CreateCaseInput, type GenerationOutput} from "@mystery/shared";
import {z} from "zod";
import {env} from "../../config/env.js";
import {systemPrompt} from "./prompts.js";

const ai=env.GEMINI_API_KEY?new GoogleGenAI({apiKey:env.GEMINI_API_KEY}):null;
const str={type:"STRING"};
const stringArray={type:"ARRAY",items:str};
const object=(properties:Record<string,unknown>,required:string[])=>({type:"OBJECT",properties,required});
const responseSchema=object({
 title:str,
 briefing:object({incident:str,location:str,timeWindow:str,knownFacts:stringArray},["incident","location","timeWindow","knownFacts"]),
 suspects:{type:"ARRAY",items:object({id:str,name:str,role:str,profile:str,alibi:str,publicMotive:str},["id","name","role","profile","alibi"])},
 timeline:{type:"ARRAY",items:object({id:str,timestamp:str,description:str,relatedSuspectIds:stringArray,relatedEvidenceIds:stringArray},["id","timestamp","description","relatedSuspectIds","relatedEvidenceIds"])},
 evidence:{type:"ARRAY",items:object({id:str,type:{type:"STRING",enum:["chat","witness","timeline","image","cctv_log","physical","document"]},title:str,summary:str,content:str,sourceLabel:str,relatedSuspectIds:stringArray,relatedTimelineEventIds:stringArray},["id","type","title","summary","content","sourceLabel","relatedSuspectIds","relatedTimelineEventIds"])},
 solution:object({culpritId:str,motive:str,opportunity:str,reconstruction:str,reasoning:{type:"ARRAY",items:object({evidenceId:str,explanation:str,implication:{type:"STRING",enum:["supports_culprit","weakens_alternative","context"]}},["evidenceId","explanation","implication"])},redHerringExplanation:str},["culpritId","motive","opportunity","reconstruction","reasoning","redHerringExplanation"])
},["title","briefing","suspects","timeline","evidence","solution"]);
class CaseValidationError extends Error {}

export async function generateCase(input:CreateCaseInput):Promise<GenerationOutput>{
  if(!ai) throw Object.assign(new Error("Mystery generation is not configured."),{status:503,code:"AI_PROVIDER_UNAVAILABLE"});
  let retryGuidance="";
  for(let attempt=0;attempt<=env.AI_MAX_RETRIES;attempt++){
    try{
      const contents=`${systemPrompt}\n\nStory seed (fictional inspiration only): ${input.storySeed}\nSetting: ${input.setting}\nTone: ${input.tone}\nDifficulty: ${input.difficulty}\nEvidence preferences: ${input.evidencePreferences.join(", ")||"balanced mix"}\n\nReturn fields title, briefing, suspects, timeline, evidence, solution. Use stable IDs suspect_01.. and evidence_01..; populate all references.${retryGuidance}`;
      const response=await ai.models.generateContent({model:env.GEMINI_MODEL,contents,config:{responseMimeType:"application/json",responseSchema,maxOutputTokens:env.AI_MAX_OUTPUT_TOKENS,thinkingConfig:{thinkingLevel:ThinkingLevel.LOW},abortSignal:AbortSignal.timeout(env.GEMINI_TIMEOUT_MS)}});
      const responseText=response.text;
      if(!responseText)throw new Error("Empty model response");
      const data=generationSchema.parse(JSON.parse(responseText));
      validateRelations(data);
      return data;
    }catch(error){
      if(error instanceof z.ZodError){
        const issues=error.issues.map(issue=>`${issue.path.join(".")||"case"}:${issue.code}`);
        console.warn("Gemini case failed schema validation",issues);
        retryGuidance=`\n\nYour previous draft failed these schema checks: ${issues.join("; ")}. Correct the listed fields and return a complete case.`;
        continue;
      }
      if(error instanceof CaseValidationError){
        console.warn("Gemini case failed consistency validation",error.message);
        retryGuidance=`\n\nYour previous draft failed this consistency check: ${error.message}. Correct all IDs and references, then return a complete case.`;
        continue;
      }
      const providerError=error as {name?:string;status?:number;code?:string};
      console.warn("Gemini provider request failed",{name:providerError.name||"unknown",status:providerError.status,code:providerError.code});
      if(providerError.name==="AbortError"||providerError.name==="TimeoutError"){
        throw Object.assign(new Error("Case generation took too long. Please try again."),{status:504,code:"AI_GENERATION_TIMEOUT"});
      }
      throw Object.assign(new Error("Mystery generation is temporarily unavailable. Please try again."),{status:503,code:"AI_PROVIDER_UNAVAILABLE"});
    }
  }
  console.error("Case generation exhausted validation retries");
  throw Object.assign(new Error("We couldn't build a consistent case. Please try again."),{status:502,code:"AI_GENERATION_FAILED"});
}
function validateRelations(data:GenerationOutput){
 const unique=(values:string[])=>new Set(values).size===values.length;
 const suspectIds=data.suspects.map(s=>s.id), evidenceIds=data.evidence.map(e=>e.id), eventIds=data.timeline.map(e=>e.id);
 if(!unique(suspectIds)||!unique(evidenceIds)||!unique(eventIds))throw new CaseValidationError("Duplicate IDs");
 if(!suspectIds.includes(data.solution.culpritId))throw new CaseValidationError("Unknown culprit");
 if(data.evidence.length<6||data.evidence.length>10||data.suspects.length<4||data.suspects.length>6)throw new CaseValidationError("Case dimensions invalid");
 if(data.solution.reasoning.length<3||data.solution.reasoning.some(r=>!evidenceIds.includes(r.evidenceId)))throw new CaseValidationError("Solution references invalid evidence");
 if(data.solution.reasoning.filter(r=>r.implication==="supports_culprit").length<2||!data.solution.reasoning.some(r=>r.implication==="weakens_alternative"))throw new CaseValidationError("Case lacks independent supporting clues or an explained alternative");
 for(const e of data.evidence)if(e.relatedSuspectIds.some(id=>!suspectIds.includes(id))||e.relatedTimelineEventIds.some(id=>!eventIds.includes(id)))throw new CaseValidationError("Evidence references unknown records");
 for(const e of data.timeline)if(e.relatedSuspectIds.some(id=>!suspectIds.includes(id))||e.relatedEvidenceIds.some(id=>!evidenceIds.includes(id)))throw new CaseValidationError("Timeline references unknown records");
}
