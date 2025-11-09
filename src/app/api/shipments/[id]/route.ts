import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const shipment = await db.shipment.findUnique({
      where: { id: params.id },
      include: {
        equipments: {
          include: {
            equipment: true
          }
        },
        histories: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!shipment) {
      return NextResponse.json(
        { error: 'Remessa não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(shipment)
  } catch (error) {
    console.error('Erro ao buscar remessa:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar remessa' },
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
    
    const shipment = await db.shipment.update({
      where: { id: params.id },
      data: {
        origin: body.origin,
        destination: body.destination,
        responsible: body.responsible,
        carrier: body.carrier,
        trackingCode: body.trackingCode,
        status: body.status,
        expectedDate: body.expectedDate ? new Date(body.expectedDate) : null,
        deliveryDate: body.deliveryDate ? new Date(body.deliveryDate) : null,
        observations: body.observations
      }
    })

    // Atualizar equipamentos da remessa se fornecidos
    if (body.equipmentIds) {
      // Remover associações existentes
      await db.shipmentEquipment.deleteMany({
        where: { shipmentId: params.id }
      })

      // Adicionar novas associações
      if (body.equipmentIds.length > 0) {
        await db.shipmentEquipment.createMany({
          data: body.equipmentIds.map((equipmentId: string) => ({
            shipmentId: params.id,
            equipmentId
          }))
        })

        // Atualizar status dos equipamentos
        await db.equipment.updateMany({
          where: {
            id: { in: body.equipmentIds }
          },
          data: {
            status: body.status === 'entregue' ? 'devolvido' : 'enviado'
          }
        })
      }
    }

    // Criar histórico se houver mudança de status
    const existingShipment = await db.shipment.findUnique({
      where: { id: params.id }
    })

    if (existingShipment && existingShipment.status !== body.status) {
      await db.shipmentHistory.create({
        data: {
          shipmentId: shipment.id,
          action: 'atualizacao',
          description: `Status atualizado: ${existingShipment.status} → ${body.status}`,
          responsible: body.responsible
        }
      })
    }

    return NextResponse.json(shipment)
  } catch (error) {
    console.error('Erro ao atualizar remessa:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar remessa' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const shipment = await db.shipment.findUnique({
      where: { id: params.id }
    })

    if (!shipment) {
      return NextResponse.json(
        { error: 'Remessa não encontrada' },
        { status: 404 }
      )
    }

    // Não permitir excluir remessas enviadas
    if (shipment.status === 'enviado') {
      return NextResponse.json(
        { error: 'Remessa enviada não pode ser excluída' },
        { status: 400 }
      )
    }

    // Remover associações de equipamentos
    await db.shipmentEquipment.deleteMany({
      where: { shipmentId: params.id }
    })

    // Excluir remessa
    await db.shipment.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Erro ao excluir remessa:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir remessa' },
      { status: 500 }
    )
  }
}