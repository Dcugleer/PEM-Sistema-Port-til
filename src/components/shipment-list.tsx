'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Edit, Eye, Truck, Package, MapPin, User, CheckCircle } from 'lucide-react'

interface Shipment {
  id: string
  shipmentNumber: string
  origin: string
  destination: string
  responsible: string
  carrier?: string
  trackingCode?: string
  status: string
  shipmentDate: string
  expectedDate?: string
  deliveryDate?: string
  observations?: string
  createdAt: string
  updatedAt: string
  _count: {
    equipments: number
  }
}

interface ShipmentListProps {
  onEdit?: (shipment: Shipment) => void
  onReceive?: (shipment: Shipment) => void
  onRefresh?: () => void
}

export function ShipmentList({ onEdit, onReceive, onRefresh }: ShipmentListProps) {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchShipments()
  }, [onRefresh])

  const fetchShipments = async () => {
    try {
      const response = await fetch('/api/shipments')
      if (response.ok) {
        const data = await response.json()
        setShipments(data)
      }
    } catch (error) {
      console.error('Erro ao buscar remessas:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'preparando': return 'bg-yellow-500'
      case 'enviado': return 'bg-blue-500'
      case 'entregue': return 'bg-green-500'
      case 'cancelado': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'preparando': return 'Preparando'
      case 'enviado': return 'Enviado'
      case 'entregue': return 'Entregue'
      case 'cancelado': return 'Cancelado'
      default: return status
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = shipment.shipmentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shipment.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shipment.destination.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shipment.responsible.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (shipment.trackingCode && shipment.trackingCode.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = statusFilter === 'all' || shipment.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">Carregando remessas...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>Lista de Remessas</CardTitle>
            <CardDescription>{shipments.length} remessas cadastradas</CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar remessa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="preparando">Preparando</SelectItem>
                <SelectItem value="enviado">Enviado</SelectItem>
                <SelectItem value="entregue">Entregue</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº Remessa</TableHead>
                <TableHead>Rota</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Equipamentos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredShipments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Truck className="w-8 h-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {searchTerm || statusFilter !== 'all' 
                          ? 'Nenhuma remessa encontrada com os filtros aplicados'
                          : 'Nenhuma remessa cadastrada ainda'
                        }
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredShipments.map((shipment) => (
                  <TableRow key={shipment.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-mono text-sm">{shipment.shipmentNumber}</div>
                        {shipment.trackingCode && (
                          <div className="text-xs text-muted-foreground">Rastreio: {shipment.trackingCode}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm">{shipment.origin}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 border-t-2 border-dashed border-muted-foreground" />
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-muted-foreground" />
                          <span className="text-sm">{shipment.destination}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm">{shipment.responsible}</span>
                      </div>
                      {shipment.carrier && (
                        <div className="text-xs text-muted-foreground">{shipment.carrier}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Package className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm">{shipment._count.equipments}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className={`${getStatusColor(shipment.status)} text-white`}
                      >
                        {getStatusLabel(shipment.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>Envio: {formatDate(shipment.shipmentDate)}</div>
                        {shipment.expectedDate && (
                          <div className="text-muted-foreground">
                            Prev.: {formatDate(shipment.expectedDate)}
                          </div>
                        )}
                        {shipment.deliveryDate && (
                          <div className="text-green-600">
                            Entregue: {formatDate(shipment.deliveryDate)}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onEdit?.(shipment)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        {shipment.status === 'enviado' && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-green-600 hover:text-green-700"
                            onClick={() => onReceive?.(shipment)}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}