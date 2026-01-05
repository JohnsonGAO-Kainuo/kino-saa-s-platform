# MVP Development Plan - Kino SaaS Platform

## 🎯 Core Objective
Build a production-ready MVP for document generation (Quotations, Invoices, Receipts, Contracts) with professional asset management and multi-language support.

---

## 📋 Development Phases

### ✅ Phase 1: Critical Fixes (COMPLETED)
- [x] Remove hardcoded company information
- [x] Fix duplicate date displays in headers
- [x] Differentiate document templates (Quotation, Invoice, Receipt, Contract)
- [x] Implement proper signature/stamp placement logic
- [x] Fix PDF export crash (converted oklch colors to standard Hex for html2canvas compatibility)
- [x] Implement "Click-to-Edit" interactive preview
- [x] Completely redesigned Editor UI to match Stripe-inspired layout

---

### 🚧 Phase 2: Editor Enhancement (IN PROGRESS)
**Goal**: Allow users to override default settings per document

#### 2.1 Company Info Override
- [ ] Add "Company Information" section in Editor sidebar
- [ ] Allow temporary override of:
  - Company Name
  - Company Address
  - Company Email
  - Bank Details
- [ ] Add "Use Profile Default" toggle

#### 2.2 Asset Selection & Upload
- [ ] Signature selector dropdown (from Profile + "Upload New")
- [ ] Stamp selector dropdown (from Profile + "Upload New")
- [ ] Logo selector dropdown (from Profile + "Upload New")
- [ ] "Save to Profile" button for each asset

#### 2.3 Client Information
- [ ] Auto-complete from previous clients
- [ ] "Save as New Client" button

---

### 📦 Phase 3: Multi-Asset Management
**Goal**: Allow users to manage multiple signatures, stamps, and logos

#### 3.1 Database Schema Update
```sql
-- New table for managing multiple assets
CREATE TABLE user_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL CHECK (asset_type IN ('logo', 'signature', 'stamp')),
  asset_url TEXT NOT NULL,
  asset_name TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE user_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own assets"
  ON user_assets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own assets"
  ON user_assets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assets"
  ON user_assets FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own assets"
  ON user_assets FOR DELETE
  USING (auth.uid() = user_id);
```

#### 3.2 Profile Page Redesign
- [ ] Asset Gallery View (Grid of logos/signatures/stamps)
- [ ] "Add New" button for each asset type
- [ ] "Set as Default" action
- [ ] "Rename" and "Delete" actions
- [ ] Preview modal for each asset

---

### 🌐 Phase 4: Language Switcher
**Goal**: Persist user's preferred UI language

#### 4.1 Database Update
```sql
-- Add language preference to company_settings
ALTER TABLE company_settings 
ADD COLUMN ui_language TEXT DEFAULT 'en' CHECK (ui_language IN ('en', 'zh-TW'));
```

#### 4.2 Settings Page Enhancement
- [ ] Add "Interface Language" dropdown
- [ ] Options: English, 繁體中文
- [ ] Save preference to database
- [ ] Apply globally across all pages

#### 4.3 Context Provider
- [ ] Create `LanguageContext` to manage global UI language
- [ ] Wrap app with `LanguageProvider`
- [ ] Update all static UI text to use translation helper

---

### 🔗 Phase 5: "Add to Profile" Feature
**Goal**: Allow users to save assets from Editor directly to Profile

#### 5.1 Implementation
- [ ] "Save Logo to Profile" button in Editor
- [ ] "Save Signature to Profile" button in Editor
- [ ] "Save Stamp to Profile" button in Editor
- [ ] Modal to name the asset before saving
- [ ] Option to set as default

---

### 🎨 Phase 6: UI Polish & Final Testing
**Goal**: Ensure professional, bug-free user experience

#### 6.1 UI Consistency
- [ ] Ensure all forms follow Stripe-inspired design
- [ ] Consistent spacing, shadows, borders
- [ ] Loading states for all async operations
- [ ] Error handling with user-friendly messages

#### 6.2 Responsive Design
- [ ] Test on mobile devices
- [ ] Adjust editor layout for tablets
- [ ] Ensure PDF export works on all screen sizes

#### 6.3 Testing Checklist
- [ ] Create Quotation → Export PDF → Verify layout
- [ ] Create Invoice → Export PDF → Verify payment methods
- [ ] Create Receipt → Export PDF → Verify signature/stamp
- [ ] Create Contract → Export PDF → Verify dual signatures
- [ ] Upload multiple logos → Set default → Verify in documents
- [ ] Upload multiple signatures → Switch in editor → Verify sync
- [ ] Change UI language → Verify all pages update
- [ ] Google Login → Create document → Sign out → Sign in → Verify data persists

---

## 🚀 Deployment Checklist
- [ ] All environment variables set in Vercel
- [ ] Supabase RLS policies tested
- [ ] Database migrations applied
- [ ] Google OAuth redirect URLs configured
- [ ] PDF export tested in production
- [ ] Image upload (Supabase Storage) tested
- [ ] AI generation tested with real API key

---

## 📊 Success Metrics
- Users can create professional documents in < 2 minutes
- Asset management is intuitive (no user confusion)
- PDF exports are print-ready
- UI language switch is seamless
- Zero hardcoded company information

---

## 🛠️ Tech Stack Summary
- **Frontend**: Next.js 16 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **AI**: Google Gemini 2.0 Flash
- **PDF Export**: html2canvas + jspdf
- **Deployment**: Vercel
- **Version Control**: GitHub

---

**Last Updated**: 2026-01-06
**Status**: Phase 2/3 Integrated & Testing

