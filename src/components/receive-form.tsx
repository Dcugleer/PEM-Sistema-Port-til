'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, CheckCircle, X, Package, MapPin, User } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface ReceiveFormProps {
  shipment: any
  onReceive: (shipment: any) => void
  onCancel: () => void
  isOpen: boolean
}

export function ReceiveForm({ shipment, onReceive, onCancel, isOpen }: ReceiveFormProps) {
  const [formData, setFormData] = useState({
    deliveryDate: new Date(),
    observations: '',
    responsible: ''
  })

  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/shipments/${shipment.id}/receive`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        const result = await response.json()
        onReceive(result.shipment)
      } else {
        const error = await response.text()
        alert('Erro ao receber remessa: ' + error)
      }
    } catch (error) {
      console.error('Erro ao receber remessa:', error)
      alert('Erro ao receber remessa. Tente novamente.')
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Receber Remessa
              </CardTitle>
              <CardDescription>
                Confirme o recebimento da remessa {shipment.shipmentNumber}
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Informações da Remessa */}
          <div className="bg-muted p-4 rounded-lg mb-6">
            <h3 className="font-medium mb-3">Informações da Remessa</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="font-medium">Número:</span>
                <span className="font-mono">{shipment.shipmentNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3" />
                <span>{shipment.origin} → {shipment.destination}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-3 h-3" />
                <span>Responsável: {shipment.responsible}</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="w-3 h-3" />
                <span>{shipment._count?.equipments || 0} equipamentos</span>
              </div>
              {shipment.trackingCode && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Rastreio:</span>
                  <span className="font-mono">{shipment.trackingCode}</span>
                </div>
              )}
              {shipment.carrier && (
                <div className="flex items-center gap-2">
                  <span className="font-medium">Transportadora:</span>
                  <span>{shipment.carrier}</span>
                </div>
              )}
            </div>
          </div>

          {/* Lista de Equipamentos */}
          {shipment.equipments && shipment.equipments.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium mb-3">Equipamentos na Remessa</h3>
              <div className="border rounded-lg p-3 max-h-40 overflow-y-auto">
                <div className="space-y-2">
                  {shipment.equipments.map((se: any) => (
                    <div key={se.equipment.id} className="flex items-center justify-between text-sm">
                      <div>
                        <span className="font-medium">{se.equipment.code}</span>
                        <span className="text-muted-foreground ml-2">
                          {se.equipment.type} - {se.equipment.brand} {se.equipment.model}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {se.equipment.location}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deliveryDate">Data do Recebimento *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.deliveryDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.deliveryDate ? (
                        format(formData.deliveryDate, "PPP", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.deliveryDate}
                      onSelect={(date) => handleInputChange('deliveryDate', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="responsible">Responsável pelo Recebimento *</Label>
                <Input
                  id="responsible"
                  value={formData.responsible}
                  onChange={(e) => handleInputChange('responsible', e.target.value)}
                  placeholder="Nome do responsável"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observations">Observações do Recebimento</Label>
              <Textarea
                id="observations"
                value={formData.observations}
                onChange={(e) => handleInputChange('observations', e.target.value)}
                placeholder="Descreva o estado dos equipamentos, quaisquer anomalias, etc..."
                rows={3}
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Atenção:</strong> Ao confirmar o recebimento, o status de todos os equipamentos será atualizado para "Devolvido" e a localização será alterada para o destino da remessa.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="w-4 h-4 mr-2" />
                {loading ? 'Recebendo...' : 'Confirmar Recebimento'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}