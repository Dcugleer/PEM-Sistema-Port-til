import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Contagem de equipamentos por status
    const equipmentStats = await db.equipment.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    })

    const stats = {
      totalEquipments: 0,
      inStock: 0,
      shipped: 0,
      inMaintenance: 0,
      returned: 0
    }

    equipmentStats.forEach(stat => {
      stats.totalEquipments += stat._count.status
      switch (stat.status) {
        case 'em_estoque':
          stats.inStock = stat._count.status
          break
        case 'enviado':
          stats.shipped = stat._count.status
          break
        case 'manutencao':
          stats.inMaintenance = stat._count.status
          break
        case 'devolvido':
          stats.returned = stat._count.status
          break
      }
    })

    // Contagem de remessas por status
    const shipmentStats = await db.shipment.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    })

    const shipmentData = {
      totalShipments: 0,
      activeShipments: 0,
      deliveredShipments: 0
    }

    shipmentStats.forEach(stat => {
      shipmentData.totalShipments += stat._count.status
      if (stat.status === 'enviado' || stat.status === 'preparando') {
        shipmentData.activeShipments += stat._count.status
      }
      if (stat.status === 'entregue') {
        shipmentData.deliveredShipments = stat._count.status
      }
    })

    return NextResponse.json({
      ...stats,
      ...shipmentData
    })
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar estatísticas' },
      { status: 500 }
    )
  }
}