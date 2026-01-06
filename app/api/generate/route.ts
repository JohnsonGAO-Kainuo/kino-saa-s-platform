import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

// Define the schema that matches our FormDataType
const itemSchema = z.object({
  description: z.string().describe('Description of the service or product'),
  subItems: z.array(z.string()).optional().describe('Detailed breakdown or bullet points for this item'),
  quantity: z.number().default(1),
  unitPrice: z.number().describe('Price per unit in local currency')
});

const documentSchema = z.object({
  clientName: z.string().describe('Name of the client company or individual'),
  clientEmail: z.string().optional().describe('Email address of the client'),
  clientAddress: z.string().optional().describe('Physical address of the client'),
  items: z.array(itemSchema).describe('List of line items for the document'),
  notes: z.string().optional().describe('Any additional notes, thank you messages, or project summaries'),
  contractTerms: z.string().optional().describe('Specific terms for the contract if applicable'),
  paymentTerms: z.string().optional().describe('Payment conditions (e.g., 50% deposit, Net 30)'),
  deliveryDate: z.string().optional().describe('Expected delivery or completion date'),
  currency: z.string().default('HKD').describe('Currency code')
});

export async function POST(req: Request) {
  try {
    const { prompt, documentType, currentContext } = await req.json();

    const openai = createOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const result = await generateObject({
      model: openai('gpt-4o'),
      schema: documentSchema,
      prompt: `
        You are an expert business document assistant for Kino SaaS.
        
        TASK:
        Generate content for a ${documentType} based on this user request: "${prompt}"
        
        CONTEXT:
        ${currentContext ? `Current document content: ${JSON.stringify(currentContext)}` : 'New empty document.'}
        
        GUIDELINES:
        1. Extract client details, line items, and terms.
        2. If specific prices aren't mentioned, estimate reasonable professional market rates for the described services in Hong Kong.
        3. For "Website Development" or similar tasks, break them down into professional sub-items (e.g., "UI/UX Design", "Frontend Implementation", "SEO Setup").
        4. Generate professional, polite, and concise text for notes and terms.
        5. Default to HKD currency unless specified otherwise.
        6. Language: If the prompt is Chinese, generate Chinese content. If English, generate English.
      `,
    });

    return Response.json(result.object);
  } catch (error) {
    console.error('AI Generation Error:', error);
    return Response.json({ error: 'Failed to generate document content' }, { status: 500 });
  }
}

