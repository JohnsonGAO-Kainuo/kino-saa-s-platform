import { google } from '@ai-sdk/google';
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

    // Dynamic Prompt Engineering based on Document Type
    let roleDescription = "";
    let focusArea = "";
    
    switch (documentType) {
      case "quotation":
        roleDescription = "You are an experienced Sales Consultant.";
        focusArea = "Focus on value proposition, persuasive descriptions, and flexible terms valid for 30 days.";
        break;
      case "contract":
        roleDescription = "You are a diligent Legal Advisor.";
        focusArea = "Focus on clear liabilities, deliverables, confidentiality, and dispute resolution terms.";
        break;
      case "invoice":
      case "receipt":
        roleDescription = "You are a precise Financial Accountant.";
        focusArea = "Focus on payment deadlines, bank details placeholders, and penalty terms for late payment.";
        break;
      default:
        roleDescription = "You are a professional Business Assistant.";
        focusArea = "Focus on clarity and professionalism.";
    }

    // Use Gemini 2.0 Flash - Ultra fast and capable
    // Note: 'gemini-2.0-flash' is the standard ID. If 3.0 becomes available, update here.
    const result = await generateObject({
      model: google('gemini-2.0-flash-001'),
      schema: documentSchema,
      prompt: `
        ROLE: ${roleDescription}
        PRODUCT: Kino SaaS (Document Generation Platform)
        
        TASK:
        Generate professional content for a **${documentType.toUpperCase()}** based on this user request: "${prompt}"
        
        CONTEXT:
        ${currentContext ? `Current document content: ${JSON.stringify(currentContext)}` : 'New empty document.'}
        
        GUIDELINES:
        1. **${focusArea}**
        2. **Intelligent Expansion**: If the user gives a vague request like "Website Project", automatically break it down into professional line items (e.g., "UI/UX Design", "Frontend Development", "Backend API Integration").
        3. **Pricing**: If prices are not specified, estimate **premium/professional market rates** for Hong Kong (HKD). Do not use cheap or placeholder low values.
        4. **Language Style**:
           - If prompt is Chinese: Use **Traditional Chinese (Hong Kong Business Style)**. Use terms like "訂金" (Deposit), "餘款" (Balance), "茲收到" (Received with thanks).
           - If prompt is English: Use formal Business English.
        5. **Terms & Notes**: Generate specific, relevant terms for the ${documentType}, not generic fillers.
      `,
    });

    return Response.json(result.object);
  } catch (error: any) {
    console.error('AI Generation Error:', error);
    return Response.json({ error: error.message || 'Failed to generate document content' }, { status: 500 });
  }
}
