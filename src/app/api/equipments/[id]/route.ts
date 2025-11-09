import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const equipment = await db.equipment.findUnique({
      where: { id: params.id },
      include: {
        histories: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!equipment) {
      return NextResponse.json(
        { error: 'Equipamento não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(equipment)
  } catch (error) {
    console.error('Erro ao buscar equipamento:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar equipamento' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const equipment = await db.equipment.update({
      where: { id: params.id },
      data: {
        serialNumber: body.serialNumber,
        type: body.type,
        brand: body.brand,
        model: body.model,
        location: body.location,
        status: body.status,
        acquisitionDate: body.acquisitionDate ? new Date(body.acquisitionDate) : null,
        observations: body.observations
      }
    })

    // Criar histórico se houver mudança de status ou localização
    const existingEquipment = await db.equipment.findUnique({
      where: { id: params.id }
    })

    if (existingEquipment && (existingEquipment.status !== body.status || existingEquipment.location !== body.location)) {
      await db.equipmentHistory.create({
        data: {
          equipmentId: equipment.id,
          action: 'atualizacao',
          description: `Equipamento atualizado: ${existingEquipment.status !== body.status ? `Status: ${existingEquipment.status} → ${body.status}` : ''}${existingEquipment.location !== body.location ? `Localização: ${existingEquipment.location} → ${body.location}` : ''}`,
          location: body.location,
          responsible: 'Sistema'
        }
      })
    }

    return NextResponse.json(equipment)
  } catch (error) {
    console.error('Erro ao atualizar equipamento:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar equipamento' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar se equipamento está em alguma remessa ativa
    const activeShipment = await db.shipmentEquipment.findFirst({
      where: {
        equipmentId: params.id,
        shipment: {
          status: {
            in: ['preparando', 'enviado']
          }
        }
      }
    })

    if (activeShipment) {
      return NextResponse.json(
        { error: 'Equipamento está em uma remessa ativa e não pode ser excluído' },
        { status: 400 }
      )
    }

    await db.equipment.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir equipamento:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir equipamento' },
      { status: 500 }
    )
  }
}