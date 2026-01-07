import { z } from 'zod';

// Define the schema that matches our FormDataType
const itemSchema = z.object({
  description: z.string(),
  subItems: z.array(z.string()).optional(),
  quantity: z.number().default(1),
  unitPrice: z.number()
});

const documentSchema = z.object({
  clientName: z.string(),
  clientEmail: z.string().optional(),
  clientAddress: z.string().optional(),
  items: z.array(itemSchema),
  notes: z.string().optional(),
  contractTerms: z.string().optional(),
  paymentTerms: z.string().optional(),
  deliveryDate: z.string().optional(),
  currency: z.string().default('HKD')
});

const responseSchema = z.object({
  message: z.string().describe('The chat response to show to the user'),
  action: z.enum(['none', 'update_document']).describe('Whether the AI wants to update the document data'),
  data: documentSchema.optional().describe('The structured document data if action is update_document')
});

export async function POST(req: Request) {
  try {
    const { prompt, documentType, currentContext } = await req.json();
    const apiKey = process.env.DEEPSEEK_API_KEY;
    
    if (!apiKey) {
      return Response.json({ error: 'DeepSeek API Key is missing.' }, { status: 500 });
    }

    // Dynamic Prompt Engineering
    let roleDescription = "";
    let focusArea = "";
    
    switch (documentType) {
      case "quotation":
        roleDescription = "你是一位资深的商务销售顾问。";
        focusArea = "重点在于展示价值、描述专业，生成的条款通常有效期为30天。";
        break;
      case "contract":
        roleDescription = "你是一位严谨的法务顾问。";
        focusArea = "重点在于责任界定、交付物说明、保密条款和违约责任。";
        break;
      case "invoice":
      case "receipt":
        roleDescription = "你是一位精准的财务会计。";
        focusArea = "重点在于付款截止日期、银行账户信息、逾期利息说明。";
        break;
      default:
        roleDescription = "你是一位专业的商务助理。";
        focusArea = "追求清晰和专业。";
    }

    const systemPrompt = `你是一位专业的商务助手，擅长编写 ${documentType}。
角色: ${roleDescription}
产品: Kino SaaS (智能文档生成平台)

任务:
1. 分析用户的请求。
2. 如果用户只是在打招呼、闲聊或提出无法直接转化为文档的操作，请友好地回应（action: "none"）。
3. 如果用户要求生成、修改或补全文档内容，请提取信息并生成 JSON 数据（action: "update_document"）。
4. **多轮对话支持**: 如果提供了 "当前文档上下文"，说明这是一次修改请求。请基于上下文进行调整，而不是重头开始。

生成指南:
1. **${focusArea}**
2. **智能扩展**: 如果用户请求模糊（如"做个网站"），自动拆解为专业细项。
3. **专业定价**: 如果未指定价格，请根据香港市场行情估算 HKD 价格。
4. **语言风格**: 
   - 中文使用 **繁体中文 (香港商业习惯)**。
   - 英文使用正式 Business English。

必须返回以下格式的 JSON 对象:
{
  "message": "回复给用户的话 (例如: '好的，我已经为您更新了价格' 或 '您好！有什么我可以帮您的？')",
  "action": "update_document" 或 "none",
  "data": { // 仅在 action 为 update_document 时提供
    "clientName": "...",
    "clientEmail": "...",
    "clientAddress": "...",
    "items": [{"description": "...", "subItems": ["...", "..."], "quantity": 1, "unitPrice": 1000}],
    "notes": "...",
    "contractTerms": "...",
    "paymentTerms": "...",
    "deliveryDate": "...",
    "currency": "HKD"
  }
}`;

    const userPrompt = `用户请求: "${prompt}"
${currentContext ? `当前文档上下文 (JSON): ${JSON.stringify(currentContext)}` : '新文档，暂无上下文。'}`;

    console.log('[API] Calling DeepSeek API via direct fetch...');

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
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
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return Response.json({ error: `DeepSeek API Error: ${response.status}`, details: errorText }, { status: response.status });
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return Response.json({ error: 'DeepSeek returned an empty response.' }, { status: 500 });
    }

    try {
      const parsedResponse = JSON.parse(content);
      const validatedResponse = responseSchema.parse(parsedResponse);
      return Response.json(validatedResponse);
    } catch (parseError: any) {
      console.error('[API] Validation Error:', parseError);
      return Response.json({ 
        error: 'AI generated invalid data format.',
        details: parseError.message,
        rawContent: content
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('[API] Unexpected error:', error);
    return Response.json({ error: `Internal Server Error: ${error.message}` }, { status: 500 });
  }
}
