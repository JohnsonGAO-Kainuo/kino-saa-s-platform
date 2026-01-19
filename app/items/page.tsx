"use client"

import { useState, useEffect } from "react"
import { Package, Plus, Search, Trash2, Edit2, Tag, DollarSign, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
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

interface Item {
  id: string
  name: string
  description: string
  price: number
  unit: string
}

export default function ItemsPage() {
  const { t } = useLanguage()
  const [items, setItems] = useState<Item[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    unit: "Project"
  })

  useEffect(() => {
    const savedItems = localStorage.getItem('kino_items')
    if (savedItems) {
      setItems(JSON.parse(savedItems))
    }
  }, [])

  const saveToStorage = (newItems: Item[]) => {
    localStorage.setItem('kino_items', JSON.stringify(newItems))
    setItems(newItems)
  }

  const handleSubmit = () => {
    if (!formData.name || !formData.price) {
      toast.error("Name and Price are required")
      return
    }

    const itemData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      unit: formData.unit
    }

    if (editingItem) {
      const updated = items.map(i => i.id === editingItem.id ? { ...i, ...itemData } : i)
      saveToStorage(updated)
      toast.success("Item updated")
    } else {
      const newItem = {
        id: crypto.randomUUID(),
        ...itemData
      }
      saveToStorage([newItem, ...items])
      toast.success("Item added")
    }
    
    setIsDialogOpen(false)
    resetForm()
  }

  const handleDelete = (id: string) => {
    if (confirm("Delete this item from your catalog?")) {
      const filtered = items.filter(i => i.id !== id)
      saveToStorage(filtered)
      toast.success("Item deleted")
    }
  }

  const startEdit = (item: Item) => {
    setEditingItem(item)
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      unit: item.unit
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setEditingItem(null)
    setFormData({ name: "", description: "", price: "", unit: "Project" })
  }

  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    i.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background p-6 md:p-10 space-y-10">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">Library</h1>
          <p className="text-muted-foreground text-lg mt-2">Manage your product catalog and services</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="h-12 px-6 rounded-[16px] shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all gap-2 text-base font-bold">
              <Plus className="w-5 h-5" /> Add New Service
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px] rounded-[24px] border-border bg-card">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">{editingItem ? "Edit Service" : "New Service Item"}</DialogTitle>
              <DialogDescription>Save items you frequently use to auto-fill documents.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-5 py-4">
              <div className="grid gap-2">
                <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Item Name</Label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Logo Design" className="h-12 rounded-xl border-border bg-muted/20" />
              </div>
              <div className="grid gap-2">
                <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Description</Label>
                <Input value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="What's included in this service?" className="h-12 rounded-xl border-border bg-muted/20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Price ($)</Label>
                  <Input type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="0.00" className="h-12 rounded-xl border-border bg-muted/20" />
                </div>
                <div className="grid gap-2">
                  <Label className="font-bold text-xs uppercase tracking-widest text-muted-foreground">Unit</Label>
                  <Input value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} placeholder="Project, Hour, etc." className="h-12 rounded-xl border-border bg-muted/20" />
                </div>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl">Cancel</Button>
              <Button onClick={handleSubmit} className="rounded-xl px-8 shadow-md">Save to Library</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input 
          placeholder="Search services or products..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-12 bg-card border-border shadow-sm rounded-[16px] text-base" 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredItems.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center bg-card/50 rounded-[32px] border-2 border-dashed border-border">
            <Package className="w-12 h-12 text-muted-foreground/20 mb-4" />
            <p className="text-muted-foreground font-medium">Your library is empty.</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <Card key={item.id} className="group relative border border-border bg-card hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-1 rounded-[24px] overflow-hidden">
              <CardContent className="p-0">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      <Layers className="w-6 h-6" />
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary" onClick={() => startEdit(item)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <h3 className="font-bold text-foreground text-lg tracking-tight mb-1 group-hover:text-primary transition-colors">{item.name}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 h-10 mb-6">{item.description || "No description provided"}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="flex items-center gap-1">
                      <span className="text-2xl font-black text-foreground">${item.price.toFixed(0)}</span>
                      <span className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">/ {item.unit}</span>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-secondary text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Manual Save
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
