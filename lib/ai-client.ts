import { generateText } from "ai"

const AI_MODEL = "google/gemini-2.0-flash" // Using Gemini as specified

export interface DocumentGenerationPrompt {
  documentType: "quotation" | "invoice" | "receipt" | "contract"
  description: string
  clientName?: string
  clientEmail?: string
  companyLogo?: string
  includeTerms?: boolean
}

export interface GeneratedDocumentContent {
  title: string
  client_name: string
  client_email: string
  items: Array<{
    description: string
    quantity: number
    unit_price: number
  }>
  terms?: string
  notes?: string
}

export async function generateDocumentWithAI(prompt: DocumentGenerationPrompt): Promise<GeneratedDocumentContent> {
  const systemPrompt = `You are a professional document generation AI assistant for the Kino SaaS platform. 
Your task is to generate structured document content in JSON format based on user prompts.
Always generate content that is professional, complete, and ready to use.
Support bilingual content (English and Traditional Chinese).
For ${prompt.documentType}s, include appropriate fields and professional formatting.`

  const userPrompt = `Generate a ${prompt.documentType} with the following requirements:
Description: ${prompt.description}
${prompt.clientName ? `Client Name: ${prompt.clientName}` : ""}
${prompt.clientEmail ? `Client Email: ${prompt.clientEmail}` : ""}
${prompt.includeTerms ? "Include standard payment terms and conditions" : ""}

Return a JSON object with the following structure:
{
  "title": "string",
  "client_name": "string",
  "client_email": "string",
  "items": [{"description": "string", "quantity": number, "unit_price": number}],
  "terms": "string (optional)",
  "notes": "string (optional)"
}

Make the content realistic and professional. For a website development ${prompt.documentType}, include relevant services and pricing.`

  try {
    const { text } = await generateText({
      model: AI_MODEL,
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.7,
      maxTokens: 2000,
    })

    // Parse the response to extract JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      throw new Error("No JSON found in AI response")
    }

    return JSON.parse(jsonMatch[0])
  } catch (error) {
    console.error("Error generating document with AI:", error)
    throw error
  }
}

export async function generateContractWithAI(
  description: string,
  clientName: string,
  companyName: string,
): Promise<string> {
  const systemPrompt = `You are a professional contract generation AI for the Kino SaaS platform.
Generate clear, professional contract terms that are fair and comprehensive.
Include both English and Traditional Chinese sections.`

  const userPrompt = `Generate a professional contract for the following:
Service/Product: ${description}
Client: ${clientName}
Company: ${companyName}

Create a comprehensive contract template with:
1. Parties and Scope of Work
2. Payment Terms
3. Timeline and Deliverables
4. Intellectual Property Rights
5. Confidentiality
6. Termination Clause
7. Liability Limitation
8. Dispute Resolution

Format with clear sections in both English and Traditional Chinese (中文).`

  try {
    const { text } = await generateText({
      model: AI_MODEL,
      system: systemPrompt,
      prompt: userPrompt,
      temperature: 0.7,
      maxTokens: 3000,
    })

    return text
  } catch (error) {
    console.error("Error generating contract with AI:", error)
    throw error
  }
}
