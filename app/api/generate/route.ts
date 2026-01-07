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

任务: 根据用户的请求生成结构化的 JSON 数据。

生成指南:
1. **${focusArea}**
2. **智能扩展**: 如果用户请求模糊（如"做个网站"），自动拆解为专业细项（如"UI设计"、"前端开发"、"后端API"）。
3. **专业定价**: 如果未指定价格，请根据香港市场行情估算合理的 **专业/溢价** 水平 (单位: HKD)。
4. **语言风格**:
   - 如果是中文: 使用 **繁体中文 (香港商业习惯)**。使用专业词汇如 "訂金"、"餘款"、"茲收到"。
   - 如果是英文: 使用正式的 Business English。
5. **条款与备注**: 生成与 ${documentType} 强相关的专业条款，不要使用模棱两可的废话。

必须返回以下格式的 JSON 对象:
{
  "clientName": "...",
  "clientEmail": "...",
  "clientAddress": "...",
  "items": [{"description": "...", "subItems": ["...", "..."], "quantity": 1, "unitPrice": 1000}],
  "notes": "...",
  "contractTerms": "...",
  "paymentTerms": "...",
  "deliveryDate": "...",
  "currency": "HKD"
}`;

    const userPrompt = `根据用户的请求生成内容: "${prompt}"
${currentContext ? `当前文档上下文: ${JSON.stringify(currentContext)}` : ''}`;

    console.log('[API] Calling DeepSeek API directly via fetch...');

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
      console.error('[API] DeepSeek API Direct Call Failed:', response.status, errorText);
      return Response.json({ 
        error: `DeepSeek API Error: ${response.status} ${response.statusText}`,
        details: errorText
      }, { status: response.status });
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      return Response.json({ error: 'DeepSeek returned an empty response.' }, { status: 500 });
    }

    try {
      const parsedContent = JSON.parse(content);
      // Validate with zod
      const validatedContent = documentSchema.parse(parsedContent);
      console.log('[API] Successfully generated and validated content');
      return Response.json(validatedContent);
    } catch (parseError: any) {
      console.error('[API] Failed to parse or validate JSON:', parseError);
      return Response.json({ 
        error: 'AI generated invalid data format.',
        details: parseError.message,
        rawContent: content
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('[API] Unexpected error in /api/generate:', error);
    return Response.json({ 
      error: `Internal Server Error: ${error.message}`,
      stack: error.stack
    }, { status: 500 });
  }
}
