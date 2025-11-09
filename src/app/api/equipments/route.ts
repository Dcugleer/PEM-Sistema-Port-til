import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const equipments = await db.equipment.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(equipments)
  } catch (error) {
    console.error('Erro ao buscar equipamentos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar equipamentos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const equipment = await db.equipment.create({
      data: {
        code: body.code,
        serialNumber: body.serialNumber,
        type: body.type,
        brand: body.brand,
        model: body.model,
        location: body.location,
        status: body.status || 'em_estoque',
        acquisitionDate: body.acquisitionDate ? new Date(body.acquisitionDate) : null,
        observations: body.observations
      }
    })

    // Criar histórico
    await db.equipmentHistory.create({
      data: {
        equipmentId: equipment.id,
        action: 'criacao',
        description: 'Equipamento cadastrado no sistema',
        location: body.location,
        responsible: 'Sistema'
      }
    })

    return NextResponse.json(equipment, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar equipamento:', error)
    return NextResponse.json(
      { error: 'Erro ao criar equipamento' },
      { status: 500 }
    )
  }
}