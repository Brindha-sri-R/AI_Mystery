import {describe,it,expect} from "vitest";
import {createCaseSchema,generationSchema} from "@mystery/shared";

describe("case contracts",()=>{
 it("trims and validates the minimum story seed",()=>{expect(createCaseSchema.parse({storySeed:`  ${"A quiet museum after closing, with a key that should not exist."}  `}).storySeed.startsWith("A quiet")).toBe(true);expect(createCaseSchema.safeParse({storySeed:"too short"}).success).toBe(false);});
 it("requires a culprit, suspects, evidence and an evidence-linked rationale",()=>{const result=generationSchema.safeParse({});expect(result.success).toBe(false);});
});
