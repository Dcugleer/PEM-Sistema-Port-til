import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const shipments = await db.shipment.findMany({
      include: {
        _count: {
          select: {
            equipments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(shipments)
  } catch (error) {
    console.error('Erro ao buscar remessas:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar remessas' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Gerar número de remessa automático
    const shipmentCount = await db.shipment.count()
    const shipmentNumber = `REM${String(shipmentCount + 1).padStart(4, '0')}`
    
    const shipment = await db.shipment.create({
      data: {
        shipmentNumber,
        origin: body.origin,
        destination: body.destination,
        responsible: body.responsible,
        carrier: body.carrier,
        trackingCode: body.trackingCode,
        status: 'preparando',
        expectedDate: body.expectedDate ? new Date(body.expectedDate) : null,
        observations: body.observations
      }
    })

    // Criar histórico
    await db.shipmentHistory.create({
      data: {
        shipmentId: shipment.id,
        action: 'criacao',
        description: 'Remessa criada no sistema',
        responsible: body.responsible
      }
    })

    return NextResponse.json(shipment, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar remessa:', error)
    return NextResponse.json(
      { error: 'Erro ao criar remessa' },
      { status: 500 }
    )
  }
}