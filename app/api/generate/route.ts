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

    const apiKey = process.env.DEEPSEEK_API_KEY;
    
    if (!apiKey) {
      return Response.json({ error: 'DeepSeek API Key is missing. Please add DEEPSEEK_API_KEY to environment variables.' }, { status: 500 });
    }

    // DeepSeek is OpenAI-compatible
    const deepseek = createOpenAI({
      baseURL: 'https://api.deepseek.com',
      apiKey: apiKey,
    });

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

    const result = await generateObject({
      model: deepseek('deepseek-chat'),
      schema: documentSchema,
      prompt: `
        角色: ${roleDescription}
        产品: Kino SaaS (智能文档生成平台)
        
        任务:
        根据用户的请求，为一份 **${documentType.toUpperCase()}** 生成专业的商务内容: "${prompt}"
        
        上下文信息:
        ${currentContext ? `当前文档内容: ${JSON.stringify(currentContext)}` : '新创建的空文档。'}
        
        生成指南:
        1. **${focusArea}**
        2. **智能扩展**: 如果用户请求模糊（如"做个网站"），自动拆解为专业细项（如"UI设计"、"前端开发"、"后端API"）。
        3. **专业定价**: 如果未指定价格，请根据香港市场行情估算合理的 **专业/溢价** 水平 (单位: HKD)。
        4. **语言风格**:
           - 如果是中文: 使用 **繁体中文 (香港商业习惯)**。使用专业词汇如 "訂金"、"餘款"、"茲收到"。
           - 如果是英文: 使用正式的 Business English。
        5. **条款与备注**: 生成与 ${documentType} 强相关的专业条款，不要使用模棱两可的废话。
      `,
    });

    return Response.json(result.object);
  } catch (error: any) {
    console.error('AI Generation Error:', error);
    return Response.json({ error: error.message || 'Failed to generate document content' }, { status: 500 });
  }
}
