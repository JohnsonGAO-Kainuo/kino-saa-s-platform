import { z } from 'zod';

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
    const { prompt, documentType, currentContext, externalContext, uiLanguage, focusedField } = await req.json();
    const apiKey = process.env.DEEPSEEK_API_KEY;
    
    if (!apiKey) {
      return Response.json({ error: 'DeepSeek API Key is missing.' }, { status: 500 });
    }

    const isChinese = uiLanguage === 'zh-TW' || !uiLanguage;
    const targetLangName = isChinese ? '繁體中文 (zh-TW)' : 'English';

    let roleDescription = "";
    switch (documentType) {
      case "quotation": roleDescription = isChinese ? "資深商務銷售顧問" : "Senior Sales Consultant"; break;
      case "contract": roleDescription = isChinese ? "專業法律顧問" : "Legal Counsel"; break;
      case "invoice":
      case "receipt": roleDescription = isChinese ? "精算財務會計" : "Financial Accountant"; break;
      default: roleDescription = isChinese ? "專業商務助理" : "Professional Business Assistant";
    }

    const systemPrompt = `You are a ${roleDescription} at Kino SaaS.
Current UI Language: ${targetLangName}.

STRICT RULES:
1. **Language**: EVERYTHING MUST be in ${targetLangName}.
2. **Action First**: Set action="update_document" for any relevant document request.
3. **Mathematical Integrity (CRITICAL)**: 
   - Ensure 'unitPrice' is NEVER 0 if there is any cost.
   - If the user provides a total amount (e.g., "5000") but no unit price, calculate it: unitPrice = total / quantity.
   - Example: user says "3 items for 3000", quantity=3, unitPrice=1000.
4. **Anti-Hallucination**: Use generic names like "Item A" if descriptions are missing. Mention this in your message.
5. **Context Database**: Auto-fill client/item details if a match is found in the provided databases.
6. **Signature Logic**: 
   - Quotation: NO signatures. 
   - Contract: DUAL signatures. 
   - Invoice/Receipt: ISSUER signature only.

Response Format (JSON only):
{
  "message": "Concise explanation in ${targetLangName}",
  "action": "update_document",
  "data": {
    "items": [
      { "description": "name", "quantity": 1, "unitPrice": number }
    ]
  }
}`;

    const userPrompt = `User Prompt: "${prompt}"
${currentContext ? `Current Document State: ${JSON.stringify(currentContext)}` : 'No context.'}
${externalContext ? `Client Database: ${JSON.stringify(externalContext.clients)}
Item Database: ${JSON.stringify(externalContext.items)}` : 'No external database access.'}`;

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
        temperature: 0.1 // Further lower temperature for extreme accuracy
      })
    });

    if (!response.ok) return Response.json({ error: `DeepSeek Error: ${response.status}` }, { status: response.status });

    const result = await response.json();
    const content = result.choices[0]?.message?.content;

    try {
      const parsed = JSON.parse(content);
      if (parsed.data?.items) {
        parsed.data.items = parsed.data.items.map((item: any) => {
          const qty = Number(item.quantity) || 1;
          const up = Number(item.unitPrice) || 0;
          return {
            ...item,
            quantity: qty,
            unitPrice: up === 0 && item.amount ? (Number(item.amount) / qty) : up
          };
        });
      }
      const validated = responseSchema.parse(parsed);
      return Response.json(validated);
    } catch (e: any) {
      return Response.json({ error: "Format Error", details: e.message }, { status: 500 });
    }
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
