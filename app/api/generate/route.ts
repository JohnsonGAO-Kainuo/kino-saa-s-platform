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
2. 如果用户只是在打招呼、闲聊，请友好地回应（action: "none"）。
3. 如果用户提及任何具体的项目、费用、服务或产品（如“做个宝马的项目”，“加油2000”等），请**立即**尝试生成或更新文档内容（action: "update_document"），不要只是一味地提问。即使信息不全，也可以先生成一个初步草稿，并在 message 中说明你已经为你拟好了初步内容，并询问是否需要完善。
4. **自动补全**: 如果用户只提供了一个大概的项目名称，请发挥你的专业商务知识，自动补全相关的服务项目、子项描述、以及标准的合同或付款条款。
5. **跳转/编辑意图**: 如果用户明确要求“跳转到编辑界面”、“去编辑”、“打开编辑器”或“开始修改”，请设置 action 为 "navigate_to_editor"。
6. **多语言支持**: 
   - 支持主流语言：英语 (en)、繁体中文 (zh-TW)、法语 (fr)、日语 (ja)、西班牙语 (es)、德语 (de)、韩语 (ko)。
   - 文档默认使用英语。
   - 如果用户要求生成特定语言的文档，请按需生成。
   - 如果是翻译任务，请保持 JSON 结构不变，仅翻译其中的文本内容。
7. **多轮对话支持**: 如果提供了 "当前文档上下文"，说明这是一次修改、翻译或深入讨论。请基于上下文进行调整。保持上下文中的已有信息，除非用户明确要求更改。

必须返回以下格式的 JSON 对象:
{
  "message": "回复给用户的文字",
  "action": "update_document" 或 "none" 或 "navigate_to_editor",
  "data": { ... } // 仅在 action 为 update_document 时提供
}`;

    const userPrompt = `用户请求: "${prompt}"
${currentContext ? `当前文档上下文 (JSON): ${JSON.stringify(currentContext)}` : '新文档，暂无上下文。'}`;

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
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return Response.json({ error: `DeepSeek API Error: ${response.status}` }, { status: response.status });
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      console.error('DeepSeek returned empty content');
      return Response.json({ error: 'AI returned empty response' }, { status: 500 });
    }

    try {
      const parsedResponse = JSON.parse(content);
      const validatedResponse = responseSchema.parse(parsedResponse);
      return Response.json(validatedResponse);
    } catch (parseError: any) {
      console.error('AI Response Parsing/Validation Error:', parseError);
      console.error('Raw AI Content:', content);
      return Response.json({ 
        error: 'Invalid AI response format', 
        details: parseError.message,
        rawContent: content 
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Server Error in /api/generate:', error);
    return Response.json({ error: `Server Error: ${error.message}` }, { status: 500 });
  }
}
