import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'

    // Buscar todos os equipamentos
    const equipments = await db.equipment.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (format === 'json') {
      // Exportar como JSON
      const jsonData = JSON.stringify(equipments, null, 2)
      
      return new NextResponse(jsonData, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="equipamentos_${new Date().toISOString().split('T')[0]}.json"`
        }
      })
    } else if (format === 'excel') {
      // Exportar como CSV (simulação de Excel)
      const headers = [
        'Código',
        'Número de Série',
        'Tipo',
        'Marca',
        'Modelo',
        'Localização',
        'Situação',
        'Data de Aquisição',
        'Observações',
        'Data de Criação',
        'Data de Atualização'
      ]

      const csvContent = [
        headers.join(','),
        ...equipments.map(eq => [
          eq.code,
          eq.serialNumber || '',
          eq.type,
          eq.brand,
          eq.model,
          eq.location,
          eq.status,
          eq.acquisitionDate ? new Date(eq.acquisitionDate).toLocaleDateString('pt-BR') : '',
          `"${(eq.observations || '').replace(/"/g, '""')}"`,
          new Date(eq.createdAt).toLocaleDateString('pt-BR'),
          new Date(eq.updatedAt).toLocaleDateString('pt-BR')
        ].join(','))
      ].join('\n')

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="equipamentos_${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    } else {
      // Exportar como CSV (padrão)
      const headers = [
        'Código',
        'Número de Série',
        'Tipo',
        'Marca',
        'Modelo',
        'Localização',
        'Situação',
        'Data de Aquisição',
        'Observações',
        'Data de Criação',
        'Data de Atualização'
      ]

      const csvContent = [
        headers.join(','),
        ...equipments.map(eq => [
          eq.code,
          eq.serialNumber || '',
          eq.type,
          eq.brand,
          eq.model,
          eq.location,
          eq.status,
          eq.acquisitionDate ? new Date(eq.acquisitionDate).toLocaleDateString('pt-BR') : '',
          `"${(eq.observations || '').replace(/"/g, '""')}"`,
          new Date(eq.createdAt).toLocaleDateString('pt-BR'),
          new Date(eq.updatedAt).toLocaleDateString('pt-BR')
        ].join(','))
      ].join('\n')

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="equipamentos_${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }
  } catch (error) {
    console.error('Erro na exportação:', error)
    return NextResponse.json(
      { error: 'Erro na exportação' },
      { status: 500 }
    )
  }
}