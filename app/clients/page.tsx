"use client"

import { useState, useEffect } from "react"
import { Users, Plus, Search, Mail, Phone, Trash2, Edit2, MapPin, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { useLanguage } from "@/lib/language-context"
import { cn } from "@/lib/utils"

interface Client {
  id: string
  name: string
  email: string
  phone: string
  address: string
  status: "Active" | "Inactive"
}

export default function ClientsPage() {
  const { t } = useLanguage()
  const [clients, setClients] = useState<Client[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  })

  useEffect(() => {
    const savedClients = localStorage.getItem('kino_clients')
    if (savedClients) {
      setClients(JSON.parse(savedClients))
    }
  }, [])

  const saveToStorage = (newClients: Client[]) => {
    localStorage.setItem('kino_clients', JSON.stringify(newClients))
    setClients(newClients)
  }

  const handleSubmit = () => {
    if (!formData.name) {
      toast.error("Name is required")
      return
    }

    if (editingClient) {
      const updatedClients = clients.map(c => 
        c.id === editingClient.id ? { ...c, ...formData } : c
      )
      saveToStorage(updatedClients)
      toast.success("Client updated")
    } else {
      const newClient: Client = {
        id: crypto.randomUUID(),
        ...formData,
        status: "Active"
      }
      saveToStorage([newClient, ...clients])
      toast.success("Client added")
    }
    
    setIsDialogOpen(false)
    resetForm()
  }

  const handleDelete = (id: string) => {
    if (confirm("Delete this client?")) {
      const filtered = clients.filter(c => c.id !== id)
      saveToStorage(filtered)
      toast.success("Client removed")
    }
  }

  const startEdit = (client: Client) => {
    setEditingClient(client)
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      address: client.address
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setEditingClient(null)
    setFormData({ name: "", email: "", phone: "", address: "" })
  }

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background p-6 md:p-10 space-y-10">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Clients</h1>
          <p className="text-muted-foreground text-lg mt-2">Your professional network and contacts</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="h-12 px-6 rounded-[16px] shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all gap-2 text-base font-bold">
              <Plus className="w-5 h-5" /> Add New Contact
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px] rounded-[24px] border-border bg-card">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">{editingClient ? "Edit Client" : "New Client Contact"}</DialogTitle>
              <DialogDescription>Enter the details below to save this client to your library.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-5 py-4">
              <div className="grid gap-2">
                <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Company / Name</Label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Acme Corp" className="h-12 rounded-xl border-border bg-muted/20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Email</Label>
                  <Input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="hello@company.com" className="h-12 rounded-xl border-border bg-muted/20" />
                </div>
                <div className="grid gap-2">
                  <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Phone</Label>
                  <Input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+1..." className="h-12 rounded-xl border-border bg-muted/20" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Address</Label>
                <Input value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Full business address..." className="h-12 rounded-xl border-border bg-muted/20" />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl">Cancel</Button>
              <Button onClick={handleSubmit} className="rounded-xl px-8 shadow-md">Save Contact</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input 
          placeholder="Search by name or email..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-12 bg-card border-border shadow-sm rounded-[16px] text-base" 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredClients.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center bg-card/50 rounded-[32px] border-2 border-dashed border-border">
            <Users className="w-12 h-12 text-muted-foreground/20 mb-4" />
            <p className="text-muted-foreground font-medium">No clients in your directory yet.</p>
          </div>
        ) : (
          filteredClients.map((client) => (
            <Card key={client.id} className="group relative border border-border bg-card hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 rounded-[24px] overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14 border-2 border-background shadow-md rounded-[18px]">
                      <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${client.name}&backgroundColor=F55503&fontFamily=Arial&bold=true`} />
                      <AvatarFallback className="rounded-[18px] bg-primary/10 text-primary font-bold">{client.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-bold text-foreground text-lg tracking-tight group-hover:text-primary transition-colors">{client.name}</h3>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 mt-1">Active</span>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary" onClick={() => startEdit(client)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(client.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-border/50">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground group/item">
                    <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center group-hover/item:bg-primary/10 group-hover/item:text-primary transition-colors">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate">{client.email || "No email provided"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground group/item">
                    <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center group-hover/item:bg-primary/10 group-hover/item:text-primary transition-colors">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    <span>{client.phone || "No phone provided"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground group/item">
                    <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center group-hover/item:bg-primary/10 group-hover/item:text-primary transition-colors">
                      <MapPin className="w-3.5 h-3.5" />
                    </div>
                    <span className="truncate">{client.address || "No address provided"}</span>
                  </div>
                </div>

                <div className="mt-6">
                  <Button variant="secondary" className="w-full rounded-xl gap-2 font-bold text-xs h-10 group/btn shadow-none">
                    Create Document <ExternalLink className="w-3 h-3 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
