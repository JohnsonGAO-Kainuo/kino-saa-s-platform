import { z } from 'zod';

// Define the schema that matches our FormDataType
const itemSchema = z.object({
  description: z.string(),
  subItems: z.array(z.string()).optional(),
  quantity: z.number().default(1),
  unitPrice: z.number()
});

const documentSchema = z.object({
  clientName: z.string().optional(),
  clientEmail: z.string().optional(),
  clientAddress: z.string().optional(),
  items: z.array(itemSchema).optional(),
  notes: z.string().optional(),
  contractTerms: z.string().optional(),
  paymentTerms: z.string().optional(),
  deliveryDate: z.string().optional(),
  currency: z.string().default('HKD')
});

const responseSchema = z.object({
  message: z.string().describe('The chat response to show to the user'),
  action: z.enum(['none', 'update_document', 'navigate_to_editor']).describe('Whether the AI wants to update data or navigate'),
  data: documentSchema.optional().describe('The structured document data if action is update_document')
});

export async function POST(req: Request) {
  try {
    const { prompt, documentType, currentContext, uiLanguage } = await req.json();
    const apiKey = process.env.DEEPSEEK_API_KEY;
    
    if (!apiKey) {
      return Response.json({ error: 'DeepSeek API Key is missing.' }, { status: 500 });
    }

    // Determine target language
    const isChinese = uiLanguage === 'zh-TW' || !uiLanguage;
    const targetLangName = isChinese ? '繁體中文 (zh-TW)' : 'English';

    // Dynamic Prompt Engineering
    let roleDescription = "";
    
    switch (documentType) {
      case "quotation":
        roleDescription = isChinese ? "資深商務銷售顧問" : "Senior Sales Consultant";
        break;
      case "contract":
        roleDescription = isChinese ? "專業法律顧問" : "Legal Counsel";
        break;
      case "invoice":
      case "receipt":
        roleDescription = isChinese ? "精算財務會計" : "Financial Accountant";
        break;
      default:
        roleDescription = isChinese ? "專業商務助理" : "Professional Business Assistant";
    }

    const systemPrompt = `You are a ${roleDescription} at Kino SaaS.
Current UI Language: ${targetLangName}.

STRICT RULES:
1. **Language**: EVERYTHING (the 'message' and all strings inside 'data') MUST be in ${targetLangName}. NEVER use English if the UI language is Chinese.
2. **Action First**: If the user mentions ANY project, service, or amount, you MUST set action="update_document" and provide the data. DO NOT just ask questions.
3. **Accuracy (CRITICAL)**: Use the EXACT numbers and items provided by the user. If the user says "5000", the unitPrice MUST be 5000. DO NOT change it.
4. **Anti-Hallucination**: 
   - If the user ONLY provides numbers (e.g., "5000, 2000") without specifying what they are for, DO NOT invent "Professional Consulting" or other complex names. 
   - Instead, use simple placeholders like "Item 1", "Item 2" or "Service Item A".
   - Mention in your 'message' that you've updated the amounts and are waiting for them to fill in the specific item descriptions.
5. **Context-Aware Editing**: If "Current Document State" is provided, and the user only specifies a price change, try to match the price to the most relevant existing item or add it as a new item with a generic name.
6. **Document Specifics**:
   - **Quotation**: Focus on value. NOTE: Quotations do NOT have signatures.
   - **Contract**: Focus on terms. NOTE: Contracts require dual signatures.
   - **Invoice/Receipt**: Focus on payment proof. These have one signature/stamp from the issuer.
7. **Consistency**: The 'message' must accurately reflect the 'data' changes. Keep it concise.

Response Format (JSON only):
{
  "message": "A concise response in ${targetLangName}. Explain what was updated. If descriptions were missing, ask for them politely.",
  "action": "update_document",
  "data": {
    "items": [
      { "description": "Generic name if user provided none", "quantity": 1, "unitPrice": number }
    ]
  }
}`;

    const userPrompt = `User Prompt: "${prompt}"
${currentContext ? `Current Document State: ${JSON.stringify(currentContext)}` : 'No context.'}`;

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3 // Lower temperature for higher accuracy
      })
    });

    if (!response.ok) {
      return Response.json({ error: `DeepSeek Error: ${response.status}` }, { status: response.status });
    }

    const result = await response.json();
    const content = result.choices[0]?.message?.content;

    try {
      const parsed = JSON.parse(content);
      // Extra validation: ensure data.items unitPrice are numbers
      if (parsed.data?.items) {
        parsed.data.items = parsed.data.items.map((item: any) => ({
          ...item,
          unitPrice: Number(item.unitPrice) || 0,
          quantity: Number(item.quantity) || 1
        }));
      }
      const validated = responseSchema.parse(parsed);
      return Response.json(validated);
    } catch (e: any) {
      console.error("AI Parse Error:", content);
      return Response.json({ error: "Format Error", details: e.message }, { status: 500 });
    }
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
