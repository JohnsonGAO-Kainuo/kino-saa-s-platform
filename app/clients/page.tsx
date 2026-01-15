"use client"

import { useState, useEffect } from "react"
import { Users, Plus, MoreHorizontal, Search, Mail, Phone, Trash2, Edit2, Save } from "lucide-react"
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

interface Client {
  id: string
  name: string
  email: string
  phone: string
  address: string
  status: "Active" | "Inactive"
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: ""
  })

  // Load clients from localStorage
  useEffect(() => {
    const savedClients = localStorage.getItem('kino_clients')
    if (savedClients) {
      setClients(JSON.parse(savedClients))
    } else {
      // Default data
      const defaults = [
        { id: "1", name: "Acme Corp", email: "billing@acme.com", phone: "+1 (555) 123-4567", address: "123 Acme Way", status: "Active" },
        { id: "2", name: "Globex Inc", email: "accounts@globex.com", phone: "+1 (555) 987-6543", address: "456 Globex St", status: "Active" },
      ]
      setClients(defaults as Client[])
      localStorage.setItem('kino_clients', JSON.stringify(defaults))
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
      // Update
      const updatedClients = clients.map(c => 
        c.id === editingClient.id ? { ...c, ...formData } : c
      )
      saveToStorage(updatedClients)
      toast.success("Client updated")
    } else {
      // Create
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
    const filtered = clients.filter(c => c.id !== id)
    saveToStorage(filtered)
    toast.success("Client deleted")
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
    <div className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Clients</h1>
          <p className="text-muted-foreground mt-1">Manage your customer relationships</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if(!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" /> Add Client
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-card border-border">
            <DialogHeader>
              <DialogTitle>{editingClient ? "Edit Client" : "Add New Client"}</DialogTitle>
              <DialogDescription>
                Save client details for quick access in your documents.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Acme Corp" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="billing@company.com" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+1 234 567 890" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="123 Business Rd, City" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit}>{editingClient ? "Save Changes" : "Add Client"}</Button>
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
                placeholder="Search clients..." 
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
                <TableHead className="px-8 h-14">Client</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="hidden md:table-cell">Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    No clients found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredClients.map((client) => (
                  <TableRow key={client.id} className="hover:bg-muted/30 border-border/50 group transition-colors">
                    <TableCell className="px-8 py-4 font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-border rounded-xl">
                          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${client.name}`} />
                          <AvatarFallback className="rounded-xl">{client.name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="text-foreground block">{client.name}</span>
                          <span className="text-xs text-muted-foreground md:hidden">{client.email}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="w-3.5 h-3.5 hidden md:block" />
                        <span className="truncate max-w-[150px]">{client.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="w-3.5 h-3.5" />
                        {client.phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        client.status === 'Active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {client.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => startEdit(client)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(client.id)}>
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
