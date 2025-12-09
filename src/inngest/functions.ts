import { inngest } from "./client";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";

const google = createGoogleGenerativeAI();
const openai = createOpenAI();
const anthropic = createAnthropic();

export const execute = inngest.createFunction(
  { id: "execute-ai" },
  { event: "execute/ai" },
  async ({ event, step }) => {
    await step.sleep("pretend", "5s");
    const { steps: geminiSteps } = await step.ai.wrap("gemini-generate-text", 
      generateText, 
      {
        model: google("gemini-2.5-flash"),
        system: "Você é um assistente de IA que gera texto baseado em um prompt. Você é muito inteligente e sempre responde de forma clara e precisa.",
        prompt: "Qual é a capital do Brasil?",
      }
    );

    const { steps: openaiSteps } = await step.ai.wrap("openai-generate-text", 
      generateText, 
      {
        model: openai("gpt-4"),
        system: "Você é um assistente de IA que gera texto baseado em um prompt. Você é muito inteligente e sempre responde de forma clara e precisa.",
        prompt: "Qual é a capital do Brasil?",
      }
    );

    const { steps: anthropicSteps } = await step.ai.wrap("anthropic-generate-text", 
      generateText, 
      {
        model: anthropic("claude-sonnet-4-5"),
        system: "Você é um assistente de IA que gera texto baseado em um prompt. Você é muito inteligente e sempre responde de forma clara e precisa.",
        prompt: "Qual é a capital do Brasil?",
      }
    );

    return {
      geminiSteps,
      openaiSteps,
      anthropicSteps,
    };
  },
);
