import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST() {
  try {
    // Criar usuário admin padrão
    const adminPassword = await bcrypt.hash('admin123', 10)
    const adminUser = await db.user.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        name: 'Administrador',
        username: 'admin',
        email: 'admin@pem.com',
        passwordHash: adminPassword,
        role: 'ADMIN'
      }
    })

    // Criar usuário operador
    const operatorPassword = await bcrypt.hash('oper123', 10)
    const operatorUser = await db.user.upsert({
      where: { username: 'operador' },
      update: {},
      create: {
        name: 'Operador Padrão',
        username: 'operador',
        email: 'operador@pem.com',
        passwordHash: operatorPassword,
        role: 'OPERATOR'
      }
    })

    // Criar usuário visualizador
    const viewerPassword = await bcrypt.hash('view123', 10)
    const viewerUser = await db.user.upsert({
      where: { username: 'viewer' },
      update: {},
      create: {
        name: 'Visualizador',
        username: 'viewer',
        email: 'viewer@pem.com',
        passwordHash: viewerPassword,
        role: 'VIEWER'
      }
    })

    // Criar equipamentos de exemplo
    const equipments = await Promise.all([
      db.equipment.create({
        data: {
          code: 'EQ001',
          serialNumber: 'SN001234567',
          type: 'Notebook',
          brand: 'Dell',
          model: 'Latitude 5420',
          location: 'Curitiba',
          status: 'enviado',
          acquisitionDate: new Date('2023-01-15'),
          observations: 'Fonte trocada em jan/2024',
          createdBy: adminUser.id
        }
      }),
      db.equipment.create({
        data: {
          code: 'EQ002',
          serialNumber: 'SN002345678',
          type: 'Impressora',
          brand: 'HP',
          model: 'LaserJet 1020',
          location: 'São Paulo',
          status: 'em_estoque',
          acquisitionDate: new Date('2023-03-20'),
          observations: 'OK',
          createdBy: operatorUser.id
        }
      }),
      db.equipment.create({
        data: {
          code: 'EQ003',
          serialNumber: 'SN003456789',
          type: 'Monitor',
          brand: 'LG',
          model: '24MP59G',
          location: 'Rio de Janeiro',
          status: 'manutencao',
          acquisitionDate: new Date('2023-02-10'),
          observations: 'Display com falha, em manutenção',
          createdBy: operatorUser.id
        }
      }),
      db.equipment.create({
        data: {
          code: 'EQ004',
          serialNumber: 'SN004567890',
          type: 'Desktop',
          brand: 'Lenovo',
          model: 'ThinkCentre M720q',
          location: 'Belo Horizonte',
          status: 'devolvido',
          acquisitionDate: new Date('2023-04-05'),
          observations: 'Devolvido do cliente em 15/05/2024',
          createdBy: adminUser.id
        }
      }),
      db.equipment.create({
        data: {
          code: 'EQ005',
          serialNumber: 'SN005678901',
          type: 'Teclado',
          brand: 'Logitech',
          model: 'K120',
          location: 'Porto Alegre',
          status: 'em_estoque',
          acquisitionDate: new Date('2023-05-12'),
          observations: 'Novo na caixa',
          createdBy: operatorUser.id
        }
      })
    ])

    // Criar históricos para os equipamentos
    await Promise.all([
      db.equipmentHistory.create({
        data: {
          equipmentId: equipments[0].id,
          action: 'envio',
          description: 'Equipamento enviado para cliente',
          location: 'Curitiba',
          responsible: 'João Silva'
        }
      }),
      db.equipmentHistory.create({
        data: {
          equipmentId: equipments[2].id,
          action: 'manutencao',
          description: 'Equipamento enviado para manutenção',
          location: 'Rio de Janeiro',
          responsible: 'Maria Santos'
        }
      }),
      db.equipmentHistory.create({
        data: {
          equipmentId: equipments[3].id,
          action: 'devolucao',
          description: 'Equipamento devolvido pelo cliente',
          location: 'Belo Horizonte',
          responsible: 'Carlos Oliveira'
        }
      })
    ])

    // Criar remessas de exemplo
    const shipments = await Promise.all([
      db.shipment.create({
        data: {
          shipmentNumber: 'REM0001',
          origin: 'São Paulo',
          destination: 'Curitiba',
          responsible: 'João Silva',
          carrier: 'Correios',
          trackingCode: 'BR123456789BR',
          status: 'enviado',
          shipmentDate: new Date('2024-01-10'),
          expectedDate: new Date('2024-01-15'),
          observations: 'Envio urgente',
          createdBy: adminUser.id
        }
      }),
      db.shipment.create({
        data: {
          shipmentNumber: 'REM0002',
          origin: 'Rio de Janeiro',
          destination: 'Belo Horizonte',
          responsible: 'Maria Santos',
          carrier: 'Transportadora XYZ',
          trackingCode: 'XYZ987654321',
          status: 'entregue',
          shipmentDate: new Date('2024-01-05'),
          expectedDate: new Date('2024-01-08'),
          deliveryDate: new Date('2024-01-07'),
          observations: 'Entregue com sucesso',
          createdBy: operatorUser.id
        }
      }),
      db.shipment.create({
        data: {
          shipmentNumber: 'REM0003',
          origin: 'Porto Alegre',
          destination: 'Salvador',
          responsible: 'Carlos Oliveira',
          carrier: 'Braspress',
          status: 'preparando',
          shipmentDate: new Date(),
          expectedDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 dias a partir de hoje
          observations: 'Aguardando confirmação',
          createdBy: adminUser.id
        }
      })
    ])

    // Associar equipamentos às remessas
    await Promise.all([
      db.shipmentEquipment.create({
        data: {
          shipmentId: shipments[0].id,
          equipmentId: equipments[0].id
        }
      }),
      db.shipmentEquipment.create({
        data: {
          shipmentId: shipments[1].id,
          equipmentId: equipments[3].id
        }
      })
    ])

    // Criar históricos das remessas
    await Promise.all([
      db.shipmentHistory.create({
        data: {
          shipmentId: shipments[0].id,
          action: 'envio',
          description: 'Remessa enviada',
          responsible: 'João Silva'
        }
      }),
      db.shipmentHistory.create({
        data: {
          shipmentId: shipments[1].id,
          action: 'entrega',
          description: 'Remessa entregue',
          responsible: 'Maria Santos'
        }
      })
    ])

    return NextResponse.json({
      success: true,
      message: 'Dados de exemplo criados com sucesso',
      users: {
        admin: { username: 'admin', password: 'admin123' },
        operator: { username: 'operador', password: 'oper123' },
        viewer: { username: 'viewer', password: 'view123' }
      },
      equipments: equipments.length,
      shipments: shipments.length
    })
  } catch (error) {
    console.error('Erro ao criar dados de exemplo:', error)
    return NextResponse.json(
      { error: 'Erro ao criar dados de exemplo' },
      { status: 500 }
    )
  }
}