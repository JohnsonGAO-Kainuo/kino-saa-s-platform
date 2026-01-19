import { Language } from './language-context'

/**
 * Comprehensive translation dictionary for EN and ZH-TW
 */
export const translations: Record<string, Record<Language, string>> = {
  // Navigation & General
  'Dashboard': { en: 'Dashboard', 'zh-TW': '主頁' },
  'Documents': { en: 'Documents', 'zh-TW': '文件' },
  'Profile': { en: 'Profile', 'zh-TW': '檔案' },
  'Settings': { en: 'Settings', 'zh-TW': '設定' },
  'Back to Dashboard': { en: 'Back to Dashboard', 'zh-TW': '返回主頁' },
  'Pricing': { en: 'Pricing', 'zh-TW': '定價' },
  'Help': { en: 'Help', 'zh-TW': '幫助' },
  'Logout': { en: 'Logout', 'zh-TW': '登出' },
  
  // Login Page
  'Sign in to Kino': { en: 'Sign in to Kino', 'zh-TW': '登入 Kino' },
  'Create your account': { en: 'Create your account', 'zh-TW': '建立帳戶' },
  'Welcome back to your document dashboard': { en: 'Welcome back to your document dashboard', 'zh-TW': '歡迎回到您的文件儀表板' },
  'Start generating professional documents today': { en: 'Start generating professional documents today', 'zh-TW': '立即開始生成專業文件' },
  'Email': { en: 'Email', 'zh-TW': '電郵' },
  'Password': { en: 'Password', 'zh-TW': '密碼' },
  'Forgot password?': { en: 'Forgot password?', 'zh-TW': '忘記密碼？' },
  'Sign In': { en: 'Sign In', 'zh-TW': '登入' },
  'Continue': { en: 'Continue', 'zh-TW': '繼續' },
  'Or continue with': { en: 'Or continue with', 'zh-TW': '或使用以下方式繼續' },
  'Already have an account? Sign in': { en: 'Already have an account? Sign in', 'zh-TW': '已有帳戶？登入' },
  "Don't have an account? Get started": { en: "Don't have an account? Get started", 'zh-TW': '沒有帳戶？立即開始' },
  
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
  'Preview': { en: 'Preview', 'zh-TW': '預覽' },
  'Send': { en: 'Send', 'zh-TW': '發送' },
  
  // Dashboard Stats
  'Total Documents': { en: 'Total Documents', 'zh-TW': '全部文件' },
  'Quotations': { en: 'Quotations', 'zh-TW': '報價單' },
  'Contracts': { en: 'Contracts', 'zh-TW': '合約' },
  'Invoices': { en: 'Invoices', 'zh-TW': '發票' },
  'Recent Documents': { en: 'Recent Documents', 'zh-TW': '最近文件' },
  'Recent Activity': { en: 'Recent Activity', 'zh-TW': '最近活動' },
  'All Time': { en: 'All Time', 'zh-TW': '全部時間' },
  'Drafts': { en: 'Drafts', 'zh-TW': '草稿' },
  'Legal': { en: 'Legal', 'zh-TW': '法務' },
  'Pending': { en: 'Pending', 'zh-TW': '待處理' },
  
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
  'Subtotal': { en: 'Subtotal', 'zh-TW': '小計' },
  'Total': { en: 'Total', 'zh-TW': '總計' },
  'Notes': { en: 'Notes', 'zh-TW': '備註' },
  'Terms': { en: 'Terms', 'zh-TW': '條款' },
  
  // Hero Section
  'AI-Powered Document Assistant': { en: 'AI-Powered Document Assistant', 'zh-TW': 'AI 驅動文件助手' },
  'What do you want to create today?': { en: 'What do you want to create today?', 'zh-TW': '今天想建立什麼文件？' },
  'create today?': { en: 'create today?', 'zh-TW': '建立什麼？' },
  'Describe your document in plain language, and our AI will draft it instantly. No complex forms, just chat.': { 
    en: 'Describe your document in plain language, and our AI will draft it instantly. No complex forms, just chat.', 
    'zh-TW': '用自然語言描述您的文件，AI 將立即為您起草。無需複雜表單，只需對話。' 
  },
  'Generate': { en: 'Generate', 'zh-TW': '生成' },
  'Proposals & Estimates': { en: 'Proposals & Estimates', 'zh-TW': '提案與估價' },
  'Billing & Payments': { en: 'Billing & Payments', 'zh-TW': '帳單與付款' },
  'Legal Agreements': { en: 'Legal Agreements', 'zh-TW': '法律協議' },
  
  // Subscription
  'Hobby Plan': { en: 'Free Plan', 'zh-TW': '免費方案' },
  'Free for individuals': { en: 'Free for individuals', 'zh-TW': '個人免費使用' },
  'Usage': { en: 'Usage', 'zh-TW': '使用量' },
  'documents remaining this month': { en: 'documents remaining this month', 'zh-TW': '本月剩餘文件數' },
  'Plan Highlights': { en: 'Plan Highlights', 'zh-TW': '方案亮點' },
  'Unlimited documents': { en: 'Unlimited documents', 'zh-TW': '無限文件' },
  'Custom company branding': { en: 'Custom company branding', 'zh-TW': '自訂公司品牌' },
  'Priority AI assistance': { en: 'Priority AI assistance', 'zh-TW': '優先 AI 協助' },
  'Advanced PDF export': { en: 'Advanced PDF export', 'zh-TW': '進階 PDF 匯出' },
  'Upgrade to Pro': { en: 'Upgrade to Pro', 'zh-TW': '升級至 Pro' },
  'Simple pricing, cancel anytime': { en: 'Simple pricing, cancel anytime', 'zh-TW': '簡單定價，隨時取消' },
  
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
  
  // Settings
  'Language': { en: 'Language', 'zh-TW': '語言' },
  'English': { en: 'English', 'zh-TW': '英文' },
  'Traditional Chinese': { en: 'Traditional Chinese', 'zh-TW': '繁體中文' },
  'Theme': { en: 'Theme', 'zh-TW': '主題' },
  'Light': { en: 'Light', 'zh-TW': '淺色' },
  'Dark': { en: 'Dark', 'zh-TW': '深色' },
  'System': { en: 'System', 'zh-TW': '系統' },
  
  // Status
  'Draft': { en: 'Draft', 'zh-TW': '草稿' },
  'Sent': { en: 'Sent', 'zh-TW': '已發送' },
  'Accepted': { en: 'Accepted', 'zh-TW': '已接受' },
  'Rejected': { en: 'Rejected', 'zh-TW': '已拒絕' },
  'Paid': { en: 'Paid', 'zh-TW': '已付款' },
  'Archived': { en: 'Archived', 'zh-TW': '已歸檔' },
  
  // Misc
  'Loading...': { en: 'Loading...', 'zh-TW': '載入中...' },
  'No documents yet': { en: 'No documents yet', 'zh-TW': '尚無文件' },
  'Search': { en: 'Search', 'zh-TW': '搜尋' },
  'Filter': { en: 'Filter', 'zh-TW': '篩選' },
  'Sort': { en: 'Sort', 'zh-TW': '排序' },
  'Cancel': { en: 'Cancel', 'zh-TW': '取消' },
  'Confirm': { en: 'Confirm', 'zh-TW': '確認' },
  'Close': { en: 'Close', 'zh-TW': '關閉' },
  
  // Dashboard
  'AI Workspace Active': { en: 'AI Workspace Active', 'zh-TW': 'AI 工作區已啟用' },
  'Search or ask AI...': { en: 'Search or ask AI...', 'zh-TW': '搜尋或詢問 AI...' },
  'Overview': { en: 'Overview', 'zh-TW': '概覽' },
  'View All Docs': { en: 'View All Docs', 'zh-TW': '查看所有文件' },
  'No recent documents found.': { en: 'No recent documents found.', 'zh-TW': '沒有找到最近的文件。' },
  'Create First Document': { en: 'Create First Document', 'zh-TW': '建立第一份文件' },
  
  // Quick prompts
  'Quote for Website Redesign': { en: 'Quote for Website Redesign', 'zh-TW': '網站重新設計報價' },
  'Invoice for $500': { en: 'Invoice for $500', 'zh-TW': '$500 發票' },
  'Contract for Marketing Services': { en: 'Contract for Marketing Services', 'zh-TW': '市場營銷服務合約' },
  'e.g., Create an invoice for web design services for $2,500...': { 
    en: 'e.g., Create an invoice for web design services for $2,500...', 
    'zh-TW': '例如：建立一份 $2,500 的網頁設計服務發票...' 
  },
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
