import { Language } from './language-context'

/**
 * Simplified translation dictionary for EN and ZH-TW
 */
export const translations: Record<string, Record<Language, string>> = {
  // Navigation & General
  'Dashboard': { en: 'Dashboard', 'zh-TW': '主頁' },
  'Documents': { en: 'Documents', 'zh-TW': '文件' },
  'Profile': { en: 'Profile', 'zh-TW': '檔案' },
  'Settings': { en: 'Settings', 'zh-TW': '設定' },
  'Back to Dashboard': { en: 'Back to Dashboard', 'zh-TW': '返回主頁' },
  
  // Document Types
  'Quotation': { en: 'Quotation', 'zh-TW': '報價單' },
  'Contract': { en: 'Contract', 'zh-TW': '合約' },
  'Invoice': { en: 'Invoice', 'zh-TW': '發票' },
  'Receipt': { en: 'Receipt', 'zh-TW': '收據' },
  
  // Document Actions
  'Create New': { en: 'Create New', 'zh-TW': '建立新文件' },
  'Save': { en: 'Save', 'zh-TW': '保存' },
  'Export PDF': { en: 'Export PDF', 'zh-TW': '匯出 PDF' },
  'Download': { en: 'Download', 'zh-TW': '下載' },
  'Delete': { en: 'Delete', 'zh-TW': '刪除' },
  'Edit': { en: 'Edit', 'zh-TW': '編輯' },
  
  // Dashboard Stats
  'Total Documents': { en: 'Total Documents', 'zh-TW': '全部文件' },
  'Quotations': { en: 'Quotations', 'zh-TW': '報價單' },
  'Contracts': { en: 'Contracts', 'zh-TW': '合約' },
  'Invoices': { en: 'Invoices', 'zh-TW': '發票' },
  'Recent Documents': { en: 'Recent Documents', 'zh-TW': '最近文件' },
  
  // Form Labels
  'Company Information': { en: 'Company Information', 'zh-TW': '公司資料' },
  'Company Name': { en: 'Company Name', 'zh-TW': '公司名稱' },
  'Client Information': { en: 'Client Information', 'zh-TW': '客戶資料' },
  'Client Name': { en: 'Client Name', 'zh-TW': '客戶名稱' },
  'Items & Services': { en: 'Items & Services', 'zh-TW': '項目及服務' },
  'Description': { en: 'Description', 'zh-TW': '描述' },
  'Quantity': { en: 'Quantity', 'zh-TW': '數量' },
  'Unit Price': { en: 'Unit Price', 'zh-TW': '單價' },
  'Amount': { en: 'Amount', 'zh-TW': '金額' },
  'Add Item': { en: 'Add Item', 'zh-TW': '新增項目' },
  
  // AI Agent
  'AI Business Assistant': { en: 'AI Business Assistant', 'zh-TW': 'AI 商務助理' },
  'AI Welcome Message': { 
    en: "Hi! I'm your AI Business Assistant. 🚀\n\nI can help you:\n1. **Draft instantly**: Just say \"Help me write a quotation for web development\".\n2. **Precise edits**: After generation, you can say \"Increase the price by 10%\" or \"Add UI design\".\n3. **Identify info**: Paste client requirements or invoice content, and I'll extract it for you.\n\nHow can I help you today?",
    'zh-TW': "您好！我是您的智能商務助手。🚀\n\n我可以幫您：\n1. **秒速生成**: 只要說「幫我寫一份網頁開發的報價單」，我就能為您擬好草稿。\n2. **精確修改**: 生成後如果不滿意，您可以說「把價格提高10%」或「增加一項UI設計」。\n3. **識別信息**: 您可以粘貼客戶的需求或發票內容，我會自動為您提取並填充。\n\n請問您今天要處理什麼文檔？"
  },
  'Ask AI to draft or edit...': { en: 'Ask AI to draft or edit...', 'zh-TW': '讓 AI 幫您編寫或修改...' },
  'Thinking...': { en: 'Thinking...', 'zh-TW': '正在思考...' },
  'Translated!': { en: 'Translated!', 'zh-TW': '翻譯完成！' },
  'Need help? Ask AI': { en: 'Need help? Ask AI', 'zh-TW': '需要幫助？問問 AI' },
  'Document updated by AI!': { en: 'Document updated by AI!', 'zh-TW': '文件已由 AI 更新！' },
}

export function getTranslation(key: string, language: Language): string {
  if (translations[key] && translations[key][language]) {
    return translations[key][language]
  }
  return translations[key]?.en || key
}

export function t(key: string, language: Language): string {
  return getTranslation(key, language)
}
