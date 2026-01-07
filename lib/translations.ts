import { Language } from './language-context'

/**
 * Complete translation dictionary for all supported languages
 * Keys are in English, values are objects with translations for each language
 */
export const translations: Record<string, Record<Language, string>> = {
  // Navigation & General
  'Dashboard': { en: 'Dashboard', 'zh-TW': '主頁', fr: 'Tableau de bord', ja: 'ダッシュボード', es: 'Panel de control', de: 'Dashboard', ko: '대시보드' },
  'Documents': { en: 'Documents', 'zh-TW': '文件', fr: 'Documents', ja: 'ドキュメント', es: 'Documentos', de: 'Dokumente', ko: '문서' },
  'Profile': { en: 'Profile', 'zh-TW': '檔案', fr: 'Profil', ja: 'プロフィール', es: 'Perfil', de: 'Profil', ko: '프로필' },
  'Settings': { en: 'Settings', 'zh-TW': '設定', fr: 'Paramètres', ja: '設定', es: 'Configuración', de: 'Einstellungen', ko: '설정' },
  'Back to Dashboard': { en: 'Back to Dashboard', 'zh-TW': '返回主頁', fr: 'Retour au tableau de bord', ja: 'ダッシュボードに戻る', es: 'Volver al panel', de: 'Zurück zum Dashboard', ko: '대시보드로 돌아가기' },
  
  // Document Types
  'Quotation': { en: 'Quotation', 'zh-TW': '報價單', fr: 'Devis', ja: '見積書', es: 'Cotización', de: 'Angebot', ko: '견적서' },
  'Contract': { en: 'Contract', 'zh-TW': '合約', fr: 'Contrat', ja: '契約書', es: 'Contrato', de: 'Vertrag', ko: '계약서' },
  'Invoice': { en: 'Invoice', 'zh-TW': '發票', fr: 'Facture', ja: '請求書', es: 'Factura', de: 'Rechnung', ko: '송장' },
  'Receipt': { en: 'Receipt', 'zh-TW': '收據', fr: 'Reçu', ja: '領収書', es: 'Recibo', de: 'Quittung', ko: '영수증' },
  
  // Document Actions
  'Create New': { en: 'Create New', 'zh-TW': '建立新文件', fr: 'Créer nouveau', ja: '新規作成', es: 'Crear nuevo', de: 'Neu erstellen', ko: '새로 만들기' },
  'Save': { en: 'Save', 'zh-TW': '保存', fr: 'Enregistrer', ja: '保存', es: 'Guardar', de: 'Speichern', ko: '저장' },
  'Export PDF': { en: 'Export PDF', 'zh-TW': '匯出 PDF', fr: 'Exporter PDF', ja: 'PDF出力', es: 'Exportar PDF', de: 'PDF exportieren', ko: 'PDF 내보내기' },
  'Download': { en: 'Download', 'zh-TW': '下載', fr: 'Télécharger', ja: 'ダウンロード', es: 'Descargar', de: 'Herunterladen', ko: '다운로드' },
  'Delete': { en: 'Delete', 'zh-TW': '刪除', fr: 'Supprimer', ja: '削除', es: 'Eliminar', de: 'Löschen', ko: '삭제' },
  'Edit': { en: 'Edit', 'zh-TW': '編輯', fr: 'Modifier', ja: '編集', es: 'Editar', de: 'Bearbeiten', ko: '편집' },
  
  // Dashboard Stats
  'Total Documents': { en: 'Total Documents', 'zh-TW': '全部文件', fr: 'Documents totaux', ja: '総ドキュメント数', es: 'Documentos totales', de: 'Gesamtdokumente', ko: '전체 문서' },
  'Quotations': { en: 'Quotations', 'zh-TW': '報價單', fr: 'Devis', ja: '見積書', es: 'Cotizaciones', de: 'Angebote', ko: '견적서' },
  'Contracts': { en: 'Contracts', 'zh-TW': '合約', fr: 'Contrats', ja: '契約書', es: 'Contratos', de: 'Verträge', ko: '계약서' },
  'Invoices': { en: 'Invoices', 'zh-TW': '發票', fr: 'Factures', ja: '請求書', es: 'Facturas', de: 'Rechnungen', ko: '송장' },
  'Recent Documents': { en: 'Recent Documents', 'zh-TW': '最近文件', fr: 'Documents récents', ja: '最近のドキュメント', es: 'Documentos recientes', de: 'Letzte Dokumente', ko: '최근 문서' },
  
  // Form Labels - Company Info
  'Company Information': { en: 'Company Information', 'zh-TW': '公司資料', fr: 'Informations société', ja: '会社情報', es: 'Información de empresa', de: 'Firmeninformationen', ko: '회사 정보' },
  'Company Name': { en: 'Company Name', 'zh-TW': '公司名稱', fr: 'Nom de société', ja: '会社名', es: 'Nombre de empresa', de: 'Firmenname', ko: '회사명' },
  'Company Email': { en: 'Company Email', 'zh-TW': '公司電郵', fr: 'Email société', ja: '会社メール', es: 'Correo de empresa', de: 'Firmen-E-Mail', ko: '회사 이메일' },
  'Company Address': { en: 'Company Address', 'zh-TW': '公司地址', fr: 'Adresse société', ja: '会社住所', es: 'Dirección de empresa', de: 'Firmenadresse', ko: '회사 주소' },
  'Company Phone': { en: 'Company Phone', 'zh-TW': '公司電話', fr: 'Téléphone société', ja: '会社電話', es: 'Teléfono de empresa', de: 'Firmentelefon', ko: '회사 전화' },
  
  // Form Labels - Client Info
  'Client Information': { en: 'Client Information', 'zh-TW': '客戶資料', fr: 'Informations client', ja: '顧客情報', es: 'Información del cliente', de: 'Kundeninformationen', ko: '고객 정보' },
  'Client Name': { en: 'Client Name', 'zh-TW': '客戶名稱', fr: 'Nom du client', ja: '顧客名', es: 'Nombre del cliente', de: 'Kundenname', ko: '고객명' },
  'Client Email': { en: 'Client Email', 'zh-TW': '客戶電郵', fr: 'Email client', ja: '顧客メール', es: 'Correo del cliente', de: 'Kunden-E-Mail', ko: '고객 이메일' },
  'Client Address': { en: 'Client Address', 'zh-TW': '客戶地址', fr: 'Adresse client', ja: '顧客住所', es: 'Dirección del cliente', de: 'Kundenadresse', ko: '고객 주소' },
  
  // Form Labels - Document Details
  'Document Number': { en: 'Document Number', 'zh-TW': '文件編號', fr: 'Numéro de document', ja: 'ドキュメント番号', es: 'Número de documento', de: 'Dokumentnummer', ko: '문서 번호' },
  'Issue Date': { en: 'Issue Date', 'zh-TW': '發行日期', fr: 'Date d\'émission', ja: '発行日', es: 'Fecha de emisión', de: 'Ausstellungsdatum', ko: '발행일' },
  'Due Date': { en: 'Due Date', 'zh-TW': '到期日', fr: 'Date d\'échéance', ja: '期限', es: 'Fecha de vencimiento', de: 'Fälligkeitsdatum', ko: '마감일' },
  'Valid Until': { en: 'Valid Until', 'zh-TW': '有效期至', fr: 'Valable jusqu\'au', ja: '有効期限', es: 'Válido hasta', de: 'Gültig bis', ko: '유효 기간' },
  
  // Form Labels - Items
  'Items & Services': { en: 'Items & Services', 'zh-TW': '項目及服務', fr: 'Articles et services', ja: '項目とサービス', es: 'Artículos y servicios', de: 'Artikel & Dienstleistungen', ko: '항목 및 서비스' },
  'Description': { en: 'Description', 'zh-TW': '描述', fr: 'Description', ja: '説明', es: 'Descripción', de: 'Beschreibung', ko: '설명' },
  'Quantity': { en: 'Quantity', 'zh-TW': '數量', fr: 'Quantité', ja: '数量', es: 'Cantidad', de: 'Menge', ko: '수량' },
  'Unit Price': { en: 'Unit Price', 'zh-TW': '單價', fr: 'Prix unitaire', ja: '単価', es: 'Precio unitario', de: 'Stückpreis', ko: '단가' },
  'Amount': { en: 'Amount', 'zh-TW': '金額', fr: 'Montant', ja: '金額', es: 'Importe', de: 'Betrag', ko: '금액' },
  'Add Item': { en: 'Add Item', 'zh-TW': '新增項目', fr: 'Ajouter article', ja: '項目を追加', es: 'Agregar artículo', de: 'Artikel hinzufügen', ko: '항목 추가' },
  'Add Sub-item': { en: 'Add Sub-item', 'zh-TW': '新增子項目', fr: 'Ajouter sous-article', ja: 'サブ項目を追加', es: 'Agregar subartículo', de: 'Unterartikel hinzufügen', ko: '하위 항목 추가' },
  
  // Form Labels - Financial
  'Subtotal': { en: 'Subtotal', 'zh-TW': '小計', fr: 'Sous-total', ja: '小計', es: 'Subtotal', de: 'Zwischensumme', ko: '소계' },
  'Tax': { en: 'Tax', 'zh-TW': '稅額', fr: 'Taxe', ja: '税金', es: 'Impuesto', de: 'Steuer', ko: '세금' },
  'Total': { en: 'Total', 'zh-TW': '總計', fr: 'Total', ja: '合計', es: 'Total', de: 'Gesamt', ko: '합계' },
  'Amount Paid': { en: 'Amount Paid', 'zh-TW': '已付金額', fr: 'Montant payé', ja: '支払額', es: 'Importe pagado', de: 'Bezahlter Betrag', ko: '지불 금액' },
  'Balance Due': { en: 'Balance Due', 'zh-TW': '應付餘額', fr: 'Solde dû', ja: '未払額', es: 'Saldo pendiente', de: 'Fälliger Betrag', ko: '미지급 금액' },
  
  // Form Labels - Payment
  'Payment Information': { en: 'Payment Information', 'zh-TW': '付款資料', fr: 'Informations de paiement', ja: '支払情報', es: 'Información de pago', de: 'Zahlungsinformationen', ko: '결제 정보' },
  'Bank Name': { en: 'Bank Name', 'zh-TW': '銀行名稱', fr: 'Nom de banque', ja: '銀行名', es: 'Nombre del banco', de: 'Bankname', ko: '은행명' },
  'Account Number': { en: 'Account Number', 'zh-TW': '帳戶號碼', fr: 'Numéro de compte', ja: '口座番号', es: 'Número de cuenta', de: 'Kontonummer', ko: '계좌번호' },
  'FPS ID': { en: 'FPS ID', 'zh-TW': '轉數快號碼', fr: 'ID FPS', ja: 'FPS ID', es: 'ID FPS', de: 'FPS-ID', ko: 'FPS ID' },
  'PayPal': { en: 'PayPal', 'zh-TW': 'PayPal', fr: 'PayPal', ja: 'PayPal', es: 'PayPal', de: 'PayPal', ko: 'PayPal' },
  'Payment Status': { en: 'Payment Status', 'zh-TW': '付款狀態', fr: 'Statut de paiement', ja: '支払状況', es: 'Estado de pago', de: 'Zahlungsstatus', ko: '결제 상태' },
  'Paid': { en: 'Paid', 'zh-TW': '已付款', fr: 'Payé', ja: '支払済', es: 'Pagado', de: 'Bezahlt', ko: '지불 완료' },
  'Pending': { en: 'Pending', 'zh-TW': '待付款', fr: 'En attente', ja: '未払い', es: 'Pendiente', de: 'Ausstehend', ko: '대기중' },
  'Overdue': { en: 'Overdue', 'zh-TW': '逾期', fr: 'En retard', ja: '期限切れ', es: 'Vencido', de: 'Überfällig', ko: '연체' },
  
  // Form Labels - Notes & Terms
  'Notes': { en: 'Notes', 'zh-TW': '備註', fr: 'Notes', ja: '備考', es: 'Notas', de: 'Notizen', ko: '비고' },
  'Payment Terms': { en: 'Payment Terms', 'zh-TW': '付款條款', fr: 'Conditions de paiement', ja: '支払条件', es: 'Términos de pago', de: 'Zahlungsbedingungen', ko: '결제 조건' },
  'Contract Terms': { en: 'Contract Terms', 'zh-TW': '合約條款', fr: 'Termes du contrat', ja: '契約条件', es: 'Términos del contrato', de: 'Vertragsbedingungen', ko: '계약 조건' },
  
  // Form Labels - Assets
  'Branding & Assets': { en: 'Branding & Assets', 'zh-TW': '品牌及資產', fr: 'Marque et actifs', ja: 'ブランドと資産', es: 'Marca y activos', de: 'Branding & Assets', ko: '브랜드 및 자산' },
  'Logo': { en: 'Logo', 'zh-TW': '商標', fr: 'Logo', ja: 'ロゴ', es: 'Logotipo', de: 'Logo', ko: '로고' },
  'Signature': { en: 'Signature', 'zh-TW': '簽名', fr: 'Signature', ja: '署名', es: 'Firma', de: 'Unterschrift', ko: '서명' },
  'Company Stamp': { en: 'Company Stamp', 'zh-TW': '公司印章', fr: 'Cachet société', ja: '社印', es: 'Sello de empresa', de: 'Firmenstempel', ko: '회사 도장' },
  'Upload': { en: 'Upload', 'zh-TW': '上傳', fr: 'Télécharger', ja: 'アップロード', es: 'Subir', de: 'Hochladen', ko: '업로드' },
  'Select': { en: 'Select', 'zh-TW': '選擇', fr: 'Sélectionner', ja: '選択', es: 'Seleccionar', de: 'Auswählen', ko: '선택' },
  'Remove': { en: 'Remove', 'zh-TW': '移除', fr: 'Retirer', ja: '削除', es: 'Eliminar', de: 'Entfernen', ko: '제거' },
  
  // Settings
  'Account Settings': { en: 'Account Settings', 'zh-TW': '帳戶設定', fr: 'Paramètres du compte', ja: 'アカウント設定', es: 'Configuración de cuenta', de: 'Kontoeinstellungen', ko: '계정 설정' },
  'Interface Language': { en: 'Interface Language', 'zh-TW': '界面語言', fr: 'Langue d\'interface', ja: 'インターフェース言語', es: 'Idioma de interfaz', de: 'Oberflächensprache', ko: '인터페이스 언어' },
  'System display language': { en: 'System display language', 'zh-TW': '系統顯示語言', fr: 'Langue d\'affichage système', ja: 'システム表示言語', es: 'Idioma de visualización del sistema', de: 'Systemanzeigesprache', ko: '시스템 표시 언어' },
  'Account Information': { en: 'Account Information', 'zh-TW': '帳戶資訊', fr: 'Informations du compte', ja: 'アカウント情報', es: 'Información de cuenta', de: 'Kontoinformationen', ko: '계정 정보' },
  'Full Name': { en: 'Full Name', 'zh-TW': '姓名', fr: 'Nom complet', ja: '氏名', es: 'Nombre completo', de: 'Vollständiger Name', ko: '전체 이름' },
  'Email Address': { en: 'Email Address', 'zh-TW': '電郵地址', fr: 'Adresse e-mail', ja: 'メールアドレス', es: 'Dirección de correo', de: 'E-Mail-Adresse', ko: '이메일 주소' },
  'Preferences': { en: 'Preferences', 'zh-TW': '偏好設定', fr: 'Préférences', ja: '環境設定', es: 'Preferencias', de: 'Einstellungen', ko: '환경설정' },
  'Appearance': { en: 'Appearance', 'zh-TW': '外觀', fr: 'Apparence', ja: '外観', es: 'Apariencia', de: 'Erscheinungsbild', ko: '외관' },
  'Light Mode': { en: 'Light Mode', 'zh-TW': '淺色模式', fr: 'Mode clair', ja: 'ライトモード', es: 'Modo claro', de: 'Heller Modus', ko: '라이트 모드' },
  'Security & Session': { en: 'Security & Session', 'zh-TW': '安全與登出', fr: 'Sécurité et session', ja: 'セキュリティとセッション', es: 'Seguridad y sesión', de: 'Sicherheit & Sitzung', ko: '보안 및 세션' },
  'Sign out from this device': { en: 'Sign out from this device', 'zh-TW': '登出此裝置', fr: 'Se déconnecter de cet appareil', ja: 'このデバイスからサインアウト', es: 'Cerrar sesión en este dispositivo', de: 'Von diesem Gerät abmelden', ko: '이 기기에서 로그아웃' },
  'Sign Out': { en: 'Sign Out', 'zh-TW': '登出', fr: 'Se déconnecter', ja: 'サインアウト', es: 'Cerrar sesión', de: 'Abmelden', ko: '로그아웃' },
  'Save Profile': { en: 'Save Profile', 'zh-TW': '保存設定', fr: 'Enregistrer le profil', ja: 'プロフィールを保存', es: 'Guardar perfil', de: 'Profil speichern', ko: '프로필 저장' },
  
  // AI Agent
  'AI Business Assistant': { en: 'AI Business Assistant', 'zh-TW': 'AI 商務助理', fr: 'Assistant commercial IA', ja: 'AIビジネスアシスタント', es: 'Asistente de negocios IA', de: 'KI-Geschäftsassistent', ko: 'AI 비즈니스 어시스턴트' },
  'AI Welcome Message': { 
    en: "Hi! I'm your AI Business Assistant. 🚀\n\nI can help you:\n1. **Draft instantly**: Just say \"Help me write a quotation for web development\".\n2. **Precise edits**: After generation, you can say \"Increase the price by 10%\" or \"Add UI design\".\n3. **Identify info**: Paste client requirements or invoice content, and I'll extract it for you.\n\nHow can I help you today?",
    'zh-TW': "您好！我是您的智能商務助手。🚀\n\n我可以幫您：\n1. **秒速生成**: 只要說「幫我寫一份網頁開發的報價單」，我就能為您擬好草稿。\n2. **精確修改**: 生成後如果不滿意，您可以說「把價格提高10%」或「增加一項UI設計」。\n3. **識別信息**: 您可以粘貼客戶的需求或發票內容，我會自動為您提取並填充。\n\n請問您今天要處理什麼文檔？",
    fr: "Bonjour ! Je suis votre assistant commercial IA. 🚀\n\nJe peux vous aider à :\n1. **Rédiger instantanément** : Dites simplement \"Aidez-moi à écrire un devis pour le développement web\".\n2. **Modifications précises** : Après la génération, vous pouvez dire \"Augmentez le prix de 10%\" ou \"Ajoutez la conception UI\".\n3. **Identifier les informations** : Collez les exigences du client ou le contenu de la facture, et je l'extrairai pour vous.\n\nComment puis-je vous aider aujourd'hui ?",
    ja: "こんにちは！私はあなたのAIビジネスアシスタントです。🚀\n\n以下のことをお手伝いできます：\n1. **即座に下書き**：「ウェブ開発の見積書を書いて」と言うだけです。\n2. **正確な編集**：生成後、「価格を10%上げて」または「UI設計を追加」と言えます。\n3. **情報の識別**：クライアントの要件や請求書の内容を貼り付けると、抽出します。\n\n今日は何をお手伝いしましょうか？",
    es: "¡Hola! Soy tu asistente de negocios IA. 🚀\n\nPuedo ayudarte a:\n1. **Redactar al instante**: Solo di \"Ayúdame a escribir una cotización para desarrollo web\".\n2. **Ediciones precisas**: Después de la generación, puedes decir \"Aumenta el precio un 10%\" o \"Agrega diseño UI\".\n3. **Identificar información**: Pega los requisitos del cliente o el contenido de la factura, y lo extraeré para ti.\n\n¿Cómo puedo ayudarte hoy?",
    de: "Hallo! Ich bin Ihr KI-Geschäftsassistent. 🚀\n\nIch kann Ihnen helfen:\n1. **Sofort entwerfen**: Sagen Sie einfach \"Helfen Sie mir, ein Angebot für Webentwicklung zu schreiben\".\n2. **Präzise Bearbeitungen**: Nach der Generierung können Sie sagen \"Erhöhen Sie den Preis um 10%\" oder \"Fügen Sie UI-Design hinzu\".\n3. **Informationen identifizieren**: Fügen Sie Kundenanforderungen oder Rechnungsinhalte ein, und ich extrahiere sie für Sie.\n\nWie kann ich Ihnen heute helfen?",
    ko: "안녕하세요! 저는 여러분의 AI 비즈니스 어시스턴트입니다. 🚀\n\n다음을 도와드릴 수 있습니다:\n1. **즉시 작성**: \"웹 개발에 대한 견적서를 작성해줘\"라고 말하기만 하면 됩니다.\n2. **정확한 편집**: 생성 후 \"가격을 10% 올려줘\" 또는 \"UI 디자인 추가\"라고 말할 수 있습니다.\n3. **정보 식별**: 고객 요구사항이나 송장 내용을 붙여넣으면 추출해 드립니다.\n\n오늘 무엇을 도와드릴까요?"
  },
  'Ask me anything to help with your documents...': { en: 'Ask me anything to help with your documents...', 'zh-TW': '問我任何文件相關問題...', fr: 'Posez-moi des questions sur vos documents...', ja: 'ドキュメントについて何でも聞いてください...', es: 'Pregúntame sobre tus documentos...', de: 'Fragen Sie mich zu Ihren Dokumenten...', ko: '문서에 대해 무엇이든 물어보세요...' },
  'Send': { en: 'Send', 'zh-TW': '傳送', fr: 'Envoyer', ja: '送信', es: 'Enviar', de: 'Senden', ko: '보내기' },
  'Translate Content': { en: 'Translate Content', 'zh-TW': '翻譯內容', fr: 'Traduire le contenu', ja: 'コンテンツを翻訳', es: 'Traducir contenido', de: 'Inhalt übersetzen', ko: '내용 번역' },
  'History': { en: 'History', 'zh-TW': '歷史記錄', fr: 'Historique', ja: '履歴', es: 'Historial', de: 'Verlauf', ko: '기록' },
  'New Chat': { en: 'New Chat', 'zh-TW': '新對話', fr: 'Nouvelle discussion', ja: '新しいチャット', es: 'Nuevo chat', de: 'Neuer Chat', ko: '새 채팅' },
  
  // Status & Messages
  'Draft': { en: 'Draft', 'zh-TW': '草稿', fr: 'Brouillon', ja: '下書き', es: 'Borrador', de: 'Entwurf', ko: '초안' },
  'Sent': { en: 'Sent', 'zh-TW': '已傳送', fr: 'Envoyé', ja: '送信済み', es: 'Enviado', de: 'Gesendet', ko: '전송됨' },
  'Saved': { en: 'Saved', 'zh-TW': '已保存', fr: 'Enregistré', ja: '保存済み', es: 'Guardado', de: 'Gespeichert', ko: '저장됨' },
  'Loading...': { en: 'Loading...', 'zh-TW': '載入中...', fr: 'Chargement...', ja: '読み込み中...', es: 'Cargando...', de: 'Lädt...', ko: '로딩 중...' },
  'Search documents, clients...': { en: 'Search documents, clients...', 'zh-TW': '搜尋文件、客戶...', fr: 'Rechercher documents, clients...', ja: 'ドキュメント、クライアントを検索...', es: 'Buscar documentos, clientes...', de: 'Dokumente, Kunden suchen...', ko: '문서, 고객 검색...' },
  
  // Document Language Selection
  'Document Language': { en: 'Document Language', 'zh-TW': '文件語言', fr: 'Langue du document', ja: 'ドキュメント言語', es: 'Idioma del documento', de: 'Dokumentensprache', ko: '문서 언어' },
  'Primary Language': { en: 'Primary Language', 'zh-TW': '主要語言', fr: 'Langue principale', ja: '主要言語', es: 'Idioma principal', de: 'Hauptsprache', ko: '주 언어' },
  'Secondary Language': { en: 'Secondary Language', 'zh-TW': '次要語言', fr: 'Langue secondaire', ja: '副言語', es: 'Idioma secundario', de: 'Zweitsprache', ko: '보조 언어' },
  'Bilingual Mode': { en: 'Bilingual Mode', 'zh-TW': '雙語模式', fr: 'Mode bilingue', ja: 'バイリンガルモード', es: 'Modo bilingüe', de: 'Zweisprachiger Modus', ko: '이중 언어 모드' },
  'Show both languages side by side': { en: 'Show both languages side by side', 'zh-TW': '並排顯示兩種語言', fr: 'Afficher les deux langues côte à côte', ja: '両方の言語を並べて表示', es: 'Mostrar ambos idiomas lado a lado', de: 'Beide Sprachen nebeneinander anzeigen', ko: '두 언어를 나란히 표시' },
  
  // Common Actions
  'Cancel': { en: 'Cancel', 'zh-TW': '取消', fr: 'Annuler', ja: 'キャンセル', es: 'Cancelar', de: 'Abbrechen', ko: '취소' },
  'Confirm': { en: 'Confirm', 'zh-TW': '確認', fr: 'Confirmer', ja: '確認', es: 'Confirmar', de: 'Bestätigen', ko: '확인' },
  'Close': { en: 'Close', 'zh-TW': '關閉', fr: 'Fermer', ja: '閉じる', es: 'Cerrar', de: 'Schließen', ko: '닫기' },
  'Open': { en: 'Open', 'zh-TW': '開啟', fr: 'Ouvrir', ja: '開く', es: 'Abrir', de: 'Öffnen', ko: '열기' },
  'View': { en: 'View', 'zh-TW': '查看', fr: 'Voir', ja: '表示', es: 'Ver', de: 'Ansehen', ko: '보기' },
  'Preview': { en: 'Preview', 'zh-TW': '預覽', fr: 'Aperçu', ja: 'プレビュー', es: 'Vista previa', de: 'Vorschau', ko: '미리보기' },
  
  // Profile & Assets
  'Business Profile': { en: 'Business Profile', 'zh-TW': '商務檔案', fr: 'Profil d\'entreprise', ja: 'ビジネスプロフィール', es: 'Perfil empresarial', de: 'Geschäftsprofil', ko: '비즈니스 프로필' },
  'Company Identity': { en: 'Company Identity', 'zh-TW': '公司識別', fr: 'Identité d\'entreprise', ja: '企業アイデンティティ', es: 'Identidad corporativa', de: 'Unternehmensidentität', ko: '회사 정체성' },
  'Asset Library': { en: 'Asset Library', 'zh-TW': '資產庫', fr: 'Bibliothèque d\'actifs', ja: 'アセットライブラリ', es: 'Biblioteca de activos', de: 'Asset-Bibliothek', ko: '자산 라이브러리' },
  'Default': { en: 'Default', 'zh-TW': '預設', fr: 'Par défaut', ja: 'デフォルト', es: 'Predeterminado', de: 'Standard', ko: '기본값' },
  'Set as Default': { en: 'Set as Default', 'zh-TW': '設為預設', fr: 'Définir par défaut', ja: 'デフォルトに設定', es: 'Establecer como predeterminado', de: 'Als Standard festlegen', ko: '기본값으로 설정' },
  'Manage your company brand assets': { en: 'Manage your company brand assets', 'zh-TW': '管理您的公司品牌資產', fr: 'Gérez les actifs de votre marque', ja: '会社のブランド資産を管理', es: 'Gestiona los activos de tu marca', de: 'Verwalten Sie Ihre Marken-Assets', ko: '회사 브랜드 자산 관리' },
  
  // Error & Success Messages
  'Error': { en: 'Error', 'zh-TW': '錯誤', fr: 'Erreur', ja: 'エラー', es: 'Error', de: 'Fehler', ko: '오류' },
  'Success': { en: 'Success', 'zh-TW': '成功', fr: 'Succès', ja: '成功', es: 'Éxito', de: 'Erfolg', ko: '성공' },
  'Profile updated!': { en: 'Profile updated!', 'zh-TW': '個人資料已更新！', fr: 'Profil mis à jour !', ja: 'プロフィールを更新しました！', es: '¡Perfil actualizado!', de: 'Profil aktualisiert!', ko: '프로필이 업데이트되었습니다!' },
  'Document saved successfully': { en: 'Document saved successfully', 'zh-TW': '文件保存成功', fr: 'Document enregistré avec succès', ja: 'ドキュメントが正常に保存されました', es: 'Documento guardado exitosamente', de: 'Dokument erfolgreich gespeichert', ko: '문서가 성공적으로 저장되었습니다' },
  'Failed to save document': { en: 'Failed to save document', 'zh-TW': '保存文件失敗', fr: 'Échec de l\'enregistrement du document', ja: 'ドキュメントの保存に失敗しました', es: 'Error al guardar documento', de: 'Dokument konnte nicht gespeichert werden', ko: '문서 저장 실패' },
  
  // Create Buttons Descriptions
  'Draft a new proposal': { en: 'Draft a new proposal', 'zh-TW': '起草新提案', fr: 'Rédiger une nouvelle proposition', ja: '新しい提案書を作成', es: 'Redactar una nueva propuesta', de: 'Neues Angebot erstellen', ko: '새 제안서 작성' },
  'Prepare a legal agreement': { en: 'Prepare a legal agreement', 'zh-TW': '準備法律協議', fr: 'Préparer un accord légal', ja: '法的合意書を準備', es: 'Preparar un acuerdo legal', de: 'Rechtsvereinbarung vorbereiten', ko: '법적 계약서 준비' },
  'Bill for completed work': { en: 'Bill for completed work', 'zh-TW': '完成工作的帳單', fr: 'Facturer le travail terminé', ja: '完了した作業の請求', es: 'Facturar trabajo completado', de: 'Abrechnung für abgeschlossene Arbeit', ko: '완료된 작업에 대한 청구' },
  'Issue a payment proof': { en: 'Issue a payment proof', 'zh-TW': '發出付款證明', fr: 'Émettre une preuve de paiement', ja: '支払証明書を発行', es: 'Emitir un comprobante de pago', de: 'Zahlungsnachweis ausstellen', ko: '결제 증명서 발행' },
  'View All': { en: 'View All', 'zh-TW': '查看全部', fr: 'Voir tout', ja: 'すべて表示', es: 'Ver todo', de: 'Alle anzeigen', ko: '모두 보기' },
  'click to manage': { en: 'click to manage', 'zh-TW': '點擊管理', fr: 'cliquer pour gérer', ja: 'クリックして管理', es: 'clic para gestionar', de: 'Klicken zum Verwalten', ko: '관리하려면 클릭' },
  
  // Misc
  'Your data is safely synced to the cloud.': { en: 'Your data is safely synced to the cloud.', 'zh-TW': '您的資料已安全同步至雲端。', fr: 'Vos données sont synchronisées en toute sécurité dans le cloud.', ja: 'データはクラウドに安全に同期されています。', es: 'Tus datos se sincronizan de forma segura en la nube.', de: 'Ihre Daten werden sicher in der Cloud synchronisiert.', ko: '데이터가 클라우드에 안전하게 동기화되었습니다.' },
  'Google Account Connected': { en: 'Google Account Connected', 'zh-TW': 'Google 帳戶已連接', fr: 'Compte Google connecté', ja: 'Googleアカウント接続済み', es: 'Cuenta de Google conectada', de: 'Google-Konto verbunden', ko: 'Google 계정 연결됨' },
  'My Account': { en: 'My Account', 'zh-TW': '我的帳戶', fr: 'Mon compte', ja: 'マイアカウント', es: 'Mi cuenta', de: 'Mein Konto', ko: '내 계정' },
  'Your Name': { en: 'Your Name', 'zh-TW': '您的姓名', fr: 'Votre nom', ja: 'お名前', es: 'Tu nombre', de: 'Ihr Name', ko: '이름' },
  'Manage your personal account preferences and security.': { en: 'Manage your personal account preferences and security.', 'zh-TW': '管理您的個人帳戶偏好和安全設定。', fr: 'Gérez vos préférences de compte personnel et votre sécurité.', ja: '個人アカウントの設定とセキュリティを管理します。', es: 'Gestiona las preferencias y seguridad de tu cuenta personal.', de: 'Verwalten Sie Ihre persönlichen Kontoeinstellungen und Sicherheit.', ko: '개인 계정 환경설정 및 보안을 관리합니다.' },
  'Choose between light and dark themes': { en: 'Choose between light and dark themes', 'zh-TW': '選擇淺色或深色主題', fr: 'Choisissez entre les thèmes clair et sombre', ja: 'ライトテーマとダークテーマを選択', es: 'Elige entre temas claro y oscuro', de: 'Wählen Sie zwischen hellen und dunklen Designs', ko: '밝은 테마와 어두운 테마 중 선택' },
}

/**
 * Get translation for a given key and language
 */
export function getTranslation(key: string, language: Language): string {
  if (translations[key] && translations[key][language]) {
    return translations[key][language]
  }
  // Fallback to English if translation not found
  return translations[key]?.en || key
}

/**
 * Shorthand translation function
 */
export function t(key: string, language: Language): string {
  return getTranslation(key, language)
}

