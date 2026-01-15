"use client"

import { Package, Plus, MoreHorizontal, Search, Tag } from "lucide-react"
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

// Placeholder data
const items = [
  { id: 1, name: "Web Development", description: "Hourly rate for development", price: 150.00, unit: "Hour" },
  { id: 2, name: "UI/UX Design", description: "Design package for landing page", price: 2500.00, unit: "Project" },
  { id: 3, name: "Hosting (Annual)", description: "Premium cloud hosting", price: 240.00, unit: "Year" },
  { id: 4, name: "SEO Audit", description: "Comprehensive site analysis", price: 500.00, unit: "Report" },
]

export default function ItemsPage() {
  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Items & Services</h1>
          <p className="text-muted-foreground mt-1">Manage your product catalog and pricing</p>
        </div>
        <Button className="rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
          <Plus className="w-4 h-4 mr-2" /> Add Item
        </Button>
      </div>

      <Card className="rounded-[24px] border-border shadow-sm overflow-hidden bg-card/50 backdrop-blur-sm">
        <CardHeader className="border-b border-border/50 px-8 py-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search items..." 
                className="pl-10 bg-background border-border shadow-none rounded-xl" 
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent border-border/50">
                <TableHead className="px-8 h-14 w-[300px]">Item Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead className="text-right px-8">Price</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id} className="hover:bg-muted/30 border-border/50 group transition-colors">
                  <TableCell className="px-8 py-4 font-medium">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Package className="w-4 h-4" />
                      </div>
                      <span className="text-foreground">{item.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-md truncate">
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
                  <TableCell>
                    <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
