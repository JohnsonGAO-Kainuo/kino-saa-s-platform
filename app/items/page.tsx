"use client"

import { useState, useEffect } from "react"
import { Package, Plus, MoreHorizontal, Search, Trash2, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
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

interface Item {
  id: string
  name: string
  description: string
  price: number
  unit: string
}

export default function ItemsPage() {
  const [items, setItems] = useState<Item[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    unit: "Project"
  })

  // Load items from localStorage
  useEffect(() => {
    const savedItems = localStorage.getItem('kino_items')
    if (savedItems) {
      setItems(JSON.parse(savedItems))
    } else {
      const defaults = [
        { id: "1", name: "Web Development", description: "Hourly rate for development", price: 150.00, unit: "Hour" },
        { id: "2", name: "UI/UX Design", description: "Design package for landing page", price: 2500.00, unit: "Project" },
        { id: "3", name: "Hosting (Annual)", description: "Premium cloud hosting", price: 240.00, unit: "Year" },
      ]
      setItems(defaults)
      localStorage.setItem('kino_items', JSON.stringify(defaults))
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
    const filtered = items.filter(i => i.id !== id)
    saveToStorage(filtered)
    toast.success("Item deleted")
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
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Items & Services</h1>
          <p className="text-muted-foreground mt-1">Manage your product catalog and pricing</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" /> Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-card border-border">
            <DialogHeader>
              <DialogTitle>{editingItem ? "Edit Item" : "Add New Item"}</DialogTitle>
              <DialogDescription>
                Create predefined items to quickly add to your documents.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Item Name</Label>
                <Input id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Web Development" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Service details..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">Price</Label>
                  <Input id="price" type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} placeholder="0.00" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Input id="unit" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} placeholder="Hour, Project, etc." />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>{editingItem ? "Save Changes" : "Add Item"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="rounded-[24px] border-border shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
        <CardHeader className="border-b border-border/50 px-6 py-4 md:px-8 md:py-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search items..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-border shadow-none rounded-xl" 
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="px-8 h-14 w-[300px]">Item Name</TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="text-right px-8">Price</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No items found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.id} className="hover:bg-muted/30 border-border/50 group transition-colors">
                    <TableCell className="px-8 py-4 font-medium">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary hidden md:block">
                          <Package className="w-4 h-4" />
                        </div>
                        <span className="text-foreground">{item.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-md truncate hidden md:table-cell">
                      {item.description}
                    </TableCell>
                    <TableCell>
                      <div className="inline-flex items-center px-2 py-1 rounded-md bg-muted text-xs font-medium text-muted-foreground">
                        {item.unit}
                      </div>
                    </TableCell>
                    <TableCell className="text-right px-8 font-mono font-medium">
                      ${item.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => startEdit(item)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(item.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
