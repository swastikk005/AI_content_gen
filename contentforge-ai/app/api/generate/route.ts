import { NextResponse } from 'next/server';
import { fetchResearch, generateOutline, generateContent } from '@/lib/agent';
import { GenerationRequest } from '@/types';

export async function POST(req: Request) {
    const body: GenerationRequest = await req.json();
    const { topic, type, tone, length } = body;

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            const sendUpdate = (data: any) => {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
            };

            try {
                // Step 1: Research
                sendUpdate({ step: 1, label: "Researching topic...", status: "running" });
                const research = await fetchResearch(topic);
                sendUpdate({ step: 1, label: "Researching topic...", status: "done", output: research.substring(0, 100) + "..." });

                // Step 2: Outline
                sendUpdate({ step: 2, label: "Creating outline...", status: "running" });
                const outline = await generateOutline(topic, type, research);
                sendUpdate({ step: 2, label: "Creating outline...", status: "done", output: outline.slice(0, 3).join(", ") + "..." });

                // Step 3: Generate
                sendUpdate({ step: 3, label: "Writing content...", status: "running" });
                const result = await generateContent(topic, type, tone, length, outline, research);
                sendUpdate({ step: 3, label: "Writing content...", status: "done", output: "Content generated successfully!" });

                // Final Result
                sendUpdate({ done: true, result });
                controller.close();
            } catch (error: any) {
                console.error("Generation Error:", error);
                sendUpdate({ error: error.message || "An error occurred during generation" });
                controller.close();
            }
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
        },
    });
}
