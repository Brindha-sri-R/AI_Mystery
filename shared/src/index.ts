import { z } from "zod";

export const difficultySchema = z.enum(["easy", "medium", "hard"]);
export const evidenceTypeSchema = z.enum(["chat", "witness", "timeline", "image", "cctv_log", "physical", "document"]);
export type EvidenceType = z.infer<typeof evidenceTypeSchema>;
export const createCaseSchema = z.object({
  storySeed: z.string().trim().min(30, "Give the mystery at least 30 characters.").max(1000, "Keep the story seed under 1,000 characters."),
  setting: z.string().trim().min(1).max(80).default("Let AI decide"),
  tone: z.string().trim().min(1).max(80).default("Classic detective"),
  difficulty: difficultySchema.default("medium"),
  evidencePreferences: z.array(evidenceTypeSchema).max(7).default([])
});
export type CreateCaseInput = z.infer<typeof createCaseSchema>;
export const suspectSchema = z.object({ id:z.string(), name:z.string(), role:z.string(), profile:z.string(), alibi:z.string(), publicMotive:z.string().optional() });
export const timelineEventSchema = z.object({ id:z.string(), timestamp:z.string(), description:z.string(), relatedSuspectIds:z.array(z.string()), relatedEvidenceIds:z.array(z.string()) });
export const evidenceSchema = z.object({ id:z.string(), type:evidenceTypeSchema, title:z.string(), summary:z.string(), content:z.string(), createdAt:z.string().optional(), discoveredAt:z.string().optional(), sourceLabel:z.string(), relatedSuspectIds:z.array(z.string()), relatedTimelineEventIds:z.array(z.string()), media:z.object({kind:z.literal("illustration"),url:z.string().url(),alt:z.string()}).optional() });
export const publicCaseSchema = z.object({ id:z.string(), title:z.string(), difficulty:difficultySchema, setting:z.string(), tone:z.string(), fictionNotice:z.string(), briefing:z.object({incident:z.string(),location:z.string(),timeWindow:z.string(),knownFacts:z.array(z.string())}), suspects:z.array(suspectSchema).min(4).max(6), timeline:z.array(timelineEventSchema), evidence:z.array(evidenceSchema).min(6).max(10), status:z.enum(["ready","accused","completed"]), createdAt:z.string() });
export const privateSolutionSchema = z.object({ culpritId:z.string(), motive:z.string(), opportunity:z.string(), reconstruction:z.string(), reasoning:z.array(z.object({evidenceId:z.string(),explanation:z.string(),implication:z.enum(["supports_culprit","weakens_alternative","context"])})), redHerringExplanation:z.string() });
export const generationSchema = z.object({title:z.string(),briefing:publicCaseSchema.shape.briefing,suspects:publicCaseSchema.shape.suspects,timeline:publicCaseSchema.shape.timeline,evidence:publicCaseSchema.shape.evidence,solution:privateSolutionSchema});
export type PublicCase = z.infer<typeof publicCaseSchema>;
export type EvidenceItem = z.infer<typeof evidenceSchema>;
export type GenerationOutput = z.infer<typeof generationSchema>;
export type CaseResult = {isCorrect:boolean;selectedSuspectId:string;culprit:{id:string;name:string;profile:string};motive:string;opportunity:string;reconstruction:string;reasoning: z.infer<typeof privateSolutionSchema>["reasoning"];redHerringExplanation:string};
