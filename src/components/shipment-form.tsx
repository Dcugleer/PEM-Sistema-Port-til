'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { CalendarIcon, Save, X, Plus, Package, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface ShipmentFormProps {
  shipment?: any
  onSave: (shipment: any) => void
  onCancel: () => void
  isOpen: boolean
}

interface Equipment {
  id: string
  code: string
  type: string
  brand: string
  model: string
  location: string
  status: string
}

export function ShipmentForm({ shipment, onSave, onCancel, isOpen }: ShipmentFormProps) {
  const [formData, setFormData] = useState({
    origin: shipment?.origin || '',
    destination: shipment?.destination || '',
    responsible: shipment?.responsible || '',
    carrier: shipment?.carrier || '',
    trackingCode: shipment?.trackingCode || '',
    expectedDate: shipment?.expectedDate ? new Date(shipment.expectedDate) : undefined,
    observations: shipment?.observations || ''
  })

  const [availableEquipments, setAvailableEquipments] = useState<Equipment[]>([])
  const [selectedEquipments, setSelectedEquipments] = useState<string[]>(shipment?.equipments?.map((e: any) => e.equipmentId) || [])
  const [loading, setLoading] = useState(false)
  const [loadingEquipments, setLoadingEquipments] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchAvailableEquipments()
    }
  }, [isOpen])

  const fetchAvailableEquipments = async () => {
    setLoadingEquipments(true)
    try {
      const response = await fetch('/api/equipments')
      if (response.ok) {
        const equipments = await response.json()
        // Filtrar apenas equipamentos disponíveis (em estoque)
        const available = equipments.filter((eq: Equipment) => eq.status === 'em_estoque')
        setAvailableEquipments(available)
      }
    } catch (error) {
      console.error('Erro ao buscar equipamentos:', error)
    } finally {
      setLoadingEquipments(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = shipment ? `/api/shipments/${shipment.id}` : '/api/shipments'
      const method = shipment ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          equipmentIds: selectedEquipments
        }),
      })

      if (response.ok) {
        const savedShipment = await response.json()
        onSave(savedShipment)
      } else {
        const error = await response.text()
        alert('Erro ao salvar remessa: ' + error)
      }
    } catch (error) {
      console.error('Erro ao salvar remessa:', error)
      alert('Erro ao salvar remessa. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleEquipmentToggle = (equipmentId: string, checked: boolean) => {
    if (checked) {
      setSelectedEquipments(prev => [...prev, equipmentId])
    } else {
      setSelectedEquipments(prev => prev.filter(id => id !== equipmentId))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>
                {shipment ? 'Editar Remessa' : 'Nova Remessa'}
              </CardTitle>
              <CardDescription>
                {shipment ? 'Atualize as informações da remessa' : 'Crie uma nova remessa no sistema'}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="origin">Origem *</Label>
                <Input
                  id="origin"
                  value={formData.origin}
                  onChange={(e) => handleInputChange('origin', e.target.value)}
                  placeholder="São Paulo"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="destination">Destino *</Label>
                <Input
                  id="destination"
                  value={formData.destination}
                  onChange={(e) => handleInputChange('destination', e.target.value)}
                  placeholder="Curitiba"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="responsible">Responsável *</Label>
                <Input
                  id="responsible"
                  value={formData.responsible}
                  onChange={(e) => handleInputChange('responsible', e.target.value)}
                  placeholder="João Silva"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="carrier">Transportadora</Label>
                <Select value={formData.carrier} onValueChange={(value) => handleInputChange('carrier', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a transportadora" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Correios">Correios</SelectItem>
                    <SelectItem value="Sedex">Sedex</SelectItem>
                    <SelectItem value="PAC">PAC</SelectItem>
                    <SelectItem value="Transportadora XYZ">Transportadora XYZ</SelectItem>
                    <SelectItem value="Braspress">Braspress</SelectItem>
                    <SelectItem value="Jadlog">Jadlog</SelectItem>
                    <SelectItem value="Latam Cargo">Latam Cargo</SelectItem>
                    <SelectItem value="Outra">Outra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trackingCode">Código de Rastreio</Label>
                <Input
                  id="trackingCode"
                  value={formData.trackingCode}
                  onChange={(e) => handleInputChange('trackingCode', e.target.value)}
                  placeholder="BR123456789BR"
                />
              </div>

              <div className="space-y-2">
                <Label>Data Prevista de Entrega</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.expectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.expectedDate ? (
                        format(formData.expectedDate, "PPP", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.expectedDate}
                      onSelect={(date) => handleInputChange('expectedDate', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observations">Observações</Label>
              <Textarea
                id="observations"
                value={formData.observations}
                onChange={(e) => handleInputChange('observations', e.target.value)}
                placeholder="Informações adicionais sobre a remessa..."
                rows={3}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-base font-medium">Equipamentos da Remessa</Label>
                <Badge variant="secondary">
                  {selectedEquipments.length} selecionados
                </Badge>
              </div>

              {loadingEquipments ? (
                <div className="text-center py-4">
                  <Package className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Carregando equipamentos...</p>
                </div>
              ) : availableEquipments.length === 0 ? (
                <div className="text-center py-4 border rounded-lg">
                  <Package className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    Nenhum equipamento disponível em estoque
                  </p>
                </div>
              ) : (
                <div className="border rounded-lg p-4 max-h-64 overflow-y-auto">
                  <div className="space-y-3">
                    {availableEquipments.map((equipment) => (
                      <div key={equipment.id} className="flex items-center space-x-3">
                        <Checkbox
                          id={equipment.id}
                          checked={selectedEquipments.includes(equipment.id)}
                          onCheckedChange={(checked) => 
                            handleEquipmentToggle(equipment.id, checked as boolean)
                          }
                        />
                        <div className="flex-1">
                          <label
                            htmlFor={equipment.id}
                            className="text-sm font-medium cursor-pointer"
                          >
                            {equipment.code} - {equipment.type}
                          </label>
                          <div className="text-xs text-muted-foreground">
                            {equipment.brand} {equipment.model} • {equipment.location}
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {equipment.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || selectedEquipments.length === 0}>
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Salvando...' : 'Salvar Remessa'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}