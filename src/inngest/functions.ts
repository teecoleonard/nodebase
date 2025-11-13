import prisma from "@/lib/db";
import { inngest } from "./client";

export const helloWorld = inngest.createFunction(
  { id: "hello-world" },
  { event: "test/hello.world" },
  async ({ event, step }) => {
    // fetch the video
    await step.sleep("fetching", "5s");
    // transcribe the video
    await step.sleep("transcribing", "5s");
    // send the transcription to the AI
    await step.sleep("sending-to-ai", "5s");
    
    await step.run("create-workflow", async () => {
        return prisma.workflow.create({
            data: {
                name: "workflow-from-inngest",
            },
        });
    });
  },
);