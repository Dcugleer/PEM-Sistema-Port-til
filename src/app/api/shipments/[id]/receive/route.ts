import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { deliveryDate, observations, responsible } = body

    // Buscar remessa
    const shipment = await db.shipment.findUnique({
      where: { id: params.id },
      include: {
        equipments: {
          include: {
            equipment: true
          }
        }
      }
    })

    if (!shipment) {
      return NextResponse.json(
        { error: 'Remessa não encontrada' },
        { status: 404 }
      )
    }

    if (shipment.status !== 'enviado') {
      return NextResponse.json(
        { error: 'Apenas remessas enviadas podem ser recebidas' },
        { status: 400 }
      )
    }

    // Atualizar status da remessa
    const updatedShipment = await db.shipment.update({
      where: { id: params.id },
      data: {
        status: 'entregue',
        deliveryDate: deliveryDate ? new Date(deliveryDate) : new Date(),
        observations: observations ? `${shipment.observations || ''}\n\nRecebimento: ${observations}`.trim() : shipment.observations
      }
    })

    // Atualizar status dos equipamentos
    await Promise.all(
      shipment.equipments.map(async (se) => {
        await db.equipment.update({
          where: { id: se.equipment.id },
          data: {
            status: 'devolvido',
            location: shipment.destination
          }
        })

        // Criar histórico do equipamento
        await db.equipmentHistory.create({
          data: {
            equipmentId: se.equipment.id,
            action: 'recebimento',
            description: `Equipamento recebido em ${shipment.destination}`,
            location: shipment.destination,
            responsible: responsible || 'Sistema'
          }
        })
      })
    )

    // Criar histórico da remessa
    await db.shipmentHistory.create({
      data: {
        shipmentId: params.id,
        action: 'recebimento',
        description: observations || 'Remessa recebida com sucesso',
        responsible: responsible || 'Sistema'
      }
    })

    return NextResponse.json({
      success: true,
      shipment: updatedShipment,
      message: 'Remessa recebida com sucesso'
    })
  } catch (error) {
    console.error('Erro ao receber remessa:', error)
    return NextResponse.json(
      { error: 'Erro ao receber remessa' },
      { status: 500 }
    )
  }
}