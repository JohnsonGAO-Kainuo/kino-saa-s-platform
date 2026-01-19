"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus, Pencil, Trash2, Star, Loader2 } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/lib/auth-context"
import type { BusinessProfile } from "@/lib/types"
import { toast } from "sonner"
import Link from "next/link"

const emptyProfile: Omit<BusinessProfile, "id" | "user_id"> = {
  name: "",
  email: "",
  phone: "",
  address: "",
  tax_id: "",
  bank_name: "",
  account_number: "",
  fps_id: "",
  swift_code: "",
  paypal_email: "",
  default_invoice_notes: "",
  default_contract_terms: "",
  default_payment_notes: "",
  is_default: false,
}

export default function BusinessProfilePage() {
  const { user } = useAuth()
  const [profiles, setProfiles] = useState<BusinessProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState<BusinessProfile | null>(null)
  const [form, setForm] = useState<Omit<BusinessProfile, "id" | "user_id">>(emptyProfile)

  const hasDefault = useMemo(() => profiles.some(p => p.is_default), [profiles])

  useEffect(() => {
    if (!user) return
    void loadProfiles()
  }, [user])

  async function loadProfiles() {
    if (!user) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("business_profiles")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })
        .order("updated_at", { ascending: false })

      if (error) throw error
      setProfiles(data || [])
    } catch (error: any) {
      console.error(error)
      toast.error("Failed to load profiles")
    } finally {
      setLoading(false)
    }
  }

  function openCreate() {
    setEditingProfile(null)
    setForm({ ...emptyProfile, is_default: !profiles.length })
    setDialogOpen(true)
  }

  function openEdit(profile: BusinessProfile) {
    setEditingProfile(profile)
    setForm({
      name: profile.name || "",
      email: profile.email || "",
      phone: profile.phone || "",
      address: profile.address || "",
      tax_id: profile.tax_id || "",
      bank_name: profile.bank_name || "",
      account_number: profile.account_number || "",
      fps_id: profile.fps_id || "",
      swift_code: profile.swift_code || "",
      paypal_email: profile.paypal_email || "",
      default_invoice_notes: profile.default_invoice_notes || "",
      default_contract_terms: profile.default_contract_terms || "",
      default_payment_notes: profile.default_payment_notes || "",
      is_default: Boolean(profile.is_default),
    })
    setDialogOpen(true)
  }

  function updateField<K extends keyof Omit<BusinessProfile, "id" | "user_id">>(key: K, value: Omit<BusinessProfile, "id" | "user_id">[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function ensureSingleDefault(wantDefault: boolean) {
    if (!user || !wantDefault) return
    const { error } = await supabase
      .from("business_profiles")
      .update({ is_default: false })
      .eq("user_id", user.id)
    if (error) throw error
  }

  async function handleSave() {
    if (!user) return toast.error("Please log in")
    if (!form.name.trim()) return toast.error("Name is required")

    const otherDefaultExists = profiles.some(p => p.is_default && p.id !== editingProfile?.id)
    const shouldBeDefault = form.is_default || !profiles.length || (!otherDefaultExists && !!editingProfile?.is_default)

    setSaving(true)
    try {
      await ensureSingleDefault(shouldBeDefault)

      const { data, error } = await supabase
        .from("business_profiles")
        .upsert({
          id: editingProfile?.id,
          user_id: user.id,
          ...form,
          is_default: shouldBeDefault,
          updated_at: new Date().toISOString(),
        })
        .select()

      if (error) throw error

      toast.success(editingProfile ? "Profile updated" : "Profile created")
      setDialogOpen(false)
      setEditingProfile(null)
      setForm(emptyProfile)
      await loadProfiles()
    } catch (error: any) {
      console.error(error)
      toast.error("Save failed")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(profile: BusinessProfile) {
    if (!user) return
    const confirmed = window.confirm("Delete this profile?")
    if (!confirmed) return

    try {
      const { error } = await supabase
        .from("business_profiles")
        .delete()
        .eq("id", profile.id)
        .eq("user_id", user.id)
      if (error) throw error

      toast.success("Profile deleted")
      const remaining = profiles.filter(p => p.id !== profile.id)
      setProfiles(remaining)

      // If we deleted the default, promote the newest remaining profile
      if (profile.is_default && remaining.length) {
        const promoteId = remaining[0].id
        await handleMakeDefault(promoteId, false)
      }
    } catch (error: any) {
      console.error(error)
      toast.error("Delete failed")
    }
  }

  async function handleMakeDefault(profileId: string, showToast = true) {
    if (!user) return
    try {
      await ensureSingleDefault(true)
      const { error } = await supabase
        .from("business_profiles")
        .update({ is_default: true, updated_at: new Date().toISOString() })
        .eq("id", profileId)
        .eq("user_id", user.id)
      if (error) throw error

      setProfiles(prev => prev.map(p => ({ ...p, is_default: p.id === profileId })))
      if (showToast) toast.success("Default profile updated")
    } catch (error: any) {
      console.error(error)
      toast.error("Failed to set default")
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Card className="max-w-xl w-full">
          <CardHeader>
            <CardTitle>Business Profiles</CardTitle>
            <CardDescription>Sign in to manage your business identities.</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-end gap-3">
            <Button asChild variant="outline"><Link href="/login">Log in</Link></Button>
            <Button asChild><Link href="/pricing">View pricing</Link></Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6 md:p-10 flex flex-col gap-8">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Business Profiles</h1>
          <p className="text-muted-foreground mt-1">Manage multiple brands/companies, payment details, and defaults.</p>
        </div>
        <Button onClick={openCreate} className="rounded-xl">
          <Plus className="w-4 h-4 mr-2" />
          New profile
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {[1,2,3].map(k => (
            <Card key={k} className="h-48 animate-pulse bg-muted/30 border-border" />
          ))}
        </div>
      ) : profiles.length ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {profiles.map(profile => (
            <Card key={profile.id} className="border-border/80">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    {profile.name}
                    {profile.is_default && <Badge variant="secondary" className="text-xs">Default</Badge>}
                  </CardTitle>
                  <CardDescription className="break-words">{profile.email || profile.phone || "No contact set"}</CardDescription>
                </div>
                <div className="flex gap-1">
                  {!profile.is_default && (
                    <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => handleMakeDefault(profile.id)}>
                      <Star className="w-4 h-4" />
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => openEdit(profile)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive" onClick={() => handleDelete(profile)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                {profile.address && <p><span className="text-foreground font-medium">Address:</span> {profile.address}</p>}
                {profile.bank_name && <p><span className="text-foreground font-medium">Bank:</span> {profile.bank_name}</p>}
                {profile.account_number && <p><span className="text-foreground font-medium">Account:</span> {profile.account_number}</p>}
                {profile.tax_id && <p><span className="text-foreground font-medium">Tax ID:</span> {profile.tax_id}</p>}
                {profile.default_invoice_notes && <p><span className="text-foreground font-medium">Invoice notes:</span> {profile.default_invoice_notes}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border-dashed border-2 border-border text-center py-14">
          <CardHeader>
            <CardTitle>No profiles yet</CardTitle>
            <CardDescription>Create your first business profile to start branding documents.</CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button onClick={openCreate} className="rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              Create profile
            </Button>
          </CardFooter>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingProfile ? "Edit profile" : "New profile"}</DialogTitle>
            <DialogDescription>Company identity, contact, and payment details.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Display name*</Label>
                <Input value={form.name} onChange={e => updateField("name", e.target.value)} placeholder="Acme Ltd." />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input value={form.email || ""} onChange={e => updateField("email", e.target.value)} placeholder="billing@acme.com" />
              </div>
              <div className="space-y-1.5">
                <Label>Phone</Label>
                <Input value={form.phone || ""} onChange={e => updateField("phone", e.target.value)} placeholder="+852 1234 5678" />
              </div>
              <div className="space-y-1.5">
                <Label>Address</Label>
                <Textarea value={form.address || ""} onChange={e => updateField("address", e.target.value)} placeholder="Room 123, Central Plaza, Hong Kong" rows={3} />
              </div>
              <div className="space-y-1.5">
                <Label>Tax / BR number</Label>
                <Input value={form.tax_id || ""} onChange={e => updateField("tax_id", e.target.value)} placeholder="12345678" />
              </div>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Bank name</Label>
                <Input value={form.bank_name || ""} onChange={e => updateField("bank_name", e.target.value)} placeholder="HSBC" />
              </div>
              <div className="space-y-1.5">
                <Label>Account number</Label>
                <Input value={form.account_number || ""} onChange={e => updateField("account_number", e.target.value)} placeholder="123-456789-001" />
              </div>
              <div className="space-y-1.5">
                <Label>FPS ID</Label>
                <Input value={form.fps_id || ""} onChange={e => updateField("fps_id", e.target.value)} placeholder="1234567" />
              </div>
              <div className="space-y-1.5">
                <Label>SWIFT code</Label>
                <Input value={form.swift_code || ""} onChange={e => updateField("swift_code", e.target.value)} placeholder="HKBCHKHH" />
              </div>
              <div className="space-y-1.5">
                <Label>PayPal email</Label>
                <Input value={form.paypal_email || ""} onChange={e => updateField("paypal_email", e.target.value)} placeholder="paypal@acme.com" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <Label>Default invoice notes</Label>
              <Textarea value={form.default_invoice_notes || ""} onChange={e => updateField("default_invoice_notes", e.target.value)} rows={3} />
            </div>
            <div className="space-y-1.5">
              <Label>Default contract terms</Label>
              <Textarea value={form.default_contract_terms || ""} onChange={e => updateField("default_contract_terms", e.target.value)} rows={3} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Default payment notes</Label>
              <Textarea value={form.default_payment_notes || ""} onChange={e => updateField("default_payment_notes", e.target.value)} rows={3} />
            </div>
            <div className="space-y-1.5 flex items-center gap-3 mt-6">
              <Checkbox
                id="is_default"
                checked={form.is_default || (!hasDefault && !profiles.length)}
                onCheckedChange={val => updateField("is_default", Boolean(val))}
              />
              <Label htmlFor="is_default" className="font-medium">Set as default for new documents</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="gap-2 rounded-xl">
              {saving && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingProfile ? "Save changes" : "Create profile"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
