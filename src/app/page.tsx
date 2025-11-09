'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Package, Truck, Archive, TrendingUp, Plus, Download, Upload } from 'lucide-react'
import { EquipmentForm } from '@/components/equipment-form'
import { ShipmentForm } from '@/components/shipment-form'
import { ImportExport } from '@/components/import-export'
import { ReceiveForm } from '@/components/receive-form'
import { EquipmentList } from '@/components/equipment-list'
import { ShipmentList } from '@/components/shipment-list'
import { UserMenu } from '@/components/user-menu'
import { ProtectedRoute } from '@/components/protected-route'
import { useAuth } from '@/contexts/auth-context'

interface DashboardStats {
  totalEquipments: number
  inStock: number
  shipped: number
  inMaintenance: number
  returned: number
  totalShipments: number
  activeShipments: number
  deliveredShipments: number
}

export default function Home() {
  const { user, hasPermission } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalEquipments: 0,
    inStock: 0,
    shipped: 0,
    inMaintenance: 0,
    returned: 0,
    totalShipments: 0,
    activeShipments: 0,
    deliveredShipments: 0
  })
  })
  const [loading, setLoading] = useState(true)
  
  // Form states
  const [equipmentFormOpen, setEquipmentFormOpen] = useState(false)
  const [shipmentFormOpen, setShipmentFormOpen] = useState(false)
  const [receiveFormOpen, setReceiveFormOpen] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null)
  const [selectedShipment, setSelectedShipment] = useState<any>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    fetchStats()
  }, [])

  const refreshData = () => {
    setRefreshKey(prev => prev + 1)
    fetchStats()
  }

  const handleNewEquipment = () => {
    setSelectedEquipment(null)
    setEquipmentFormOpen(true)
  }

  const handleEditEquipment = (equipment: any) => {
    setSelectedEquipment(equipment)
    setEquipmentFormOpen(true)
  }

  const handleSaveEquipment = () => {
    setEquipmentFormOpen(false)
    setSelectedEquipment(null)
    refreshData()
  }

  const handleNewShipment = () => {
    setSelectedShipment(null)
    setShipmentFormOpen(true)
  }

  const handleEditShipment = (shipment: any) => {
    setSelectedShipment(shipment)
    setShipmentFormOpen(true)
  }

  const handleSaveShipment = () => {
    setShipmentFormOpen(false)
    setSelectedShipment(null)
    refreshData()
  }

  const handleReceiveShipment = (shipment: any) => {
    setSelectedShipment(shipment)
    setReceiveFormOpen(true)
  }

  const handleConfirmReceive = () => {
    setReceiveFormOpen(false)
    setSelectedShipment(null)
    refreshData()
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'em_estoque': return 'bg-green-500'
      case 'enviado': return 'bg-blue-500'
      case 'manutencao': return 'bg-yellow-500'
      case 'devolvido': return 'bg-purple-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'em_estoque': return 'Em Estoque'
      case 'enviado': return 'Enviado'
      case 'manutencao': return 'Em Manutenção'
      case 'devolvido': return 'Devolvido'
      default: return status
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background p-4 md:p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">🚚 PEM - Sistema Portátil de Envio</h1>
              <p className="text-muted-foreground mt-1">Gerenciamento completo de equipamentos e remessas</p>
            </div>
            <div className="flex gap-2 items-center">
              <UserMenu />
            </div>
          </div>

          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Equipamentos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? '...' : stats.totalEquipments}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.inStock} em estoque
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Equipamentos Enviados</CardTitle>
                <Truck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? '...' : stats.shipped}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeShipments} remessas ativas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Em Manutenção</CardTitle>
                <Archive className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? '...' : stats.inMaintenance}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.returned} devolvidos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Remessas</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{loading ? '...' : stats.totalShipments}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.deliveredShipments} entregues
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Status Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Status dos Equipamentos</CardTitle>
                <CardDescription>Distribuição por situação atual</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { status: 'em_estoque', count: stats.inStock, label: 'Em Estoque' },
                  { status: 'enviado', count: stats.shipped, label: 'Enviado' },
                  { status: 'manutencao', count: stats.inMaintenance, label: 'Em Manutenção' },
                  { status: 'devolvido', count: stats.returned, label: 'Devolvido' }
                ].map((item) => (
                  <div key={item.status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(item.status)}`} />
                      <span className="text-sm">{item.label}</span>
                    </div>
                    <Badge variant="secondary">{item.count}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ações Rápidas</CardTitle>
                <CardDescription>Operações mais comuns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {hasPermission('create') && (
                  <Button className="w-full justify-start" variant="outline" onClick={handleNewEquipment}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Equipamento
                  </Button>
                )}
                {hasPermission('create') && (
                  <Button className="w-full justify-start" variant="outline" onClick={handleNewShipment}>
                    <Truck className="w-4 h-4 mr-2" />
                    Nova Remessa
                  </Button>
                )}
                {hasPermission('import') && (
                  <Button className="w-full justify-start" variant="outline">
                    <Upload className="w-4 h-4 mr-2" />
                    Importar Dados
                  </Button>
                )}
                {hasPermission('export') && (
                  <Button className="w-full justify-start" variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Relatório
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="equipments" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="equipments">Equipamentos</TabsTrigger>
              <TabsTrigger value="shipments">Remessas</TabsTrigger>
              <TabsTrigger value="import-export">Import/Export</TabsTrigger>
              <TabsTrigger value="reports">Relatórios</TabsTrigger>
            </TabsList>
            
            <TabsContent value="equipments" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Gerenciamento de Equipamentos</h2>
                {hasPermission('create') && (
                  <Button onClick={handleNewEquipment}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Equipamento
                  </Button>
                )}
              </div>
              <EquipmentList 
                key={refreshKey}
                onEdit={hasPermission('edit') ? handleEditEquipment : undefined}
                onRefresh={refreshData}
              />
            </TabsContent>
            
            <TabsContent value="shipments" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Controle de Remessas</h2>
                {hasPermission('create') && (
                  <Button onClick={handleNewShipment}>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Remessa
                  </Button>
                )}
              </div>
              <ShipmentList 
                key={refreshKey}
                onEdit={hasPermission('edit') ? handleEditShipment : undefined}
                onReceive={hasPermission('edit') ? handleReceiveShipment : undefined}
                onRefresh={refreshData}
              />
            </TabsContent>
            
            <TabsContent value="import-export" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Importação e Exportação</h2>
              </div>
              <ImportExport />
            </TabsContent>
            
            <TabsContent value="reports" className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Relatórios e Análises</h2>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Gerar Relatório
                </Button>
              </div>
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    Funcionalidade de relatórios em desenvolvimento...
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </Tabs>

        {/* Forms */}
        <EquipmentForm
          isOpen={equipmentFormOpen}
          equipment={selectedEquipment}
          onSave={handleSaveEquipment}
          onCancel={() => setEquipmentFormOpen(false)}
        />

        <ShipmentForm
          isOpen={shipmentFormOpen}
          shipment={selectedShipment}
          onSave={handleSaveShipment}
          onCancel={() => setShipmentFormOpen(false)}
        />

        <ReceiveForm
          isOpen={receiveFormOpen}
          shipment={selectedShipment}
          onReceive={handleConfirmReceive}
          onCancel={() => setReceiveFormOpen(false)}
        />
      </div>
    </ProtectedRoute>
  )
}