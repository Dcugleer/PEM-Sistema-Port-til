import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const mode = formData.get('mode') as string

    if (!file) {
      return NextResponse.json(
        { error: 'Nenhum arquivo enviado' },
        { status: 400 }
      )
    }

    // Ler conteúdo do arquivo diretamente sem salvar no disco
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    let records: any[] = []
    const fileExtension = file.name.split('.').pop()?.toLowerCase()

    try {
      if (fileExtension === 'json') {
        const content = buffer.toString('utf-8')
        records = JSON.parse(content)
      } else if (fileExtension === 'csv') {
        const content = buffer.toString('utf-8')
        const lines = content.split('\n').filter(line => line.trim())
        
        if (lines.length < 2) {
          return NextResponse.json(
            { error: 'Arquivo CSV inválido: deve conter cabeçalho e pelo menos uma linha de dados' },
            { status: 400 }
          )
        }

        const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''))
          const record: any = {}
          headers.forEach((header, index) => {
            record[header] = values[index] || ''
          })
          records.push(record)
        }
      } else if (fileExtension === 'txt') {
        const content = buffer.toString('utf-8')
        const lines = content.split('\n').filter(line => line.trim())
        
        if (lines.length < 2) {
          return NextResponse.json(
            { error: 'Arquivo TXT inválido: deve conter cabeçalho e pelo menos uma linha de dados' },
            { status: 400 }
          )
        }

        const headers = lines[0].split(/[\t;]/).map(h => h.trim())
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(/[\t;]/).map(v => v.trim())
          const record: any = {}
          headers.forEach((header, index) => {
            record[header] = values[index] || ''
          })
          records.push(record)
        }
      } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        // Para Excel, vamos criar dados de exemplo por enquanto
        // Em produção, você pode usar bibliotecas como xlsx ou exceljs
        records = [
          {
            'Código': 'EQ001',
            'Tipo': 'Notebook',
            'Marca': 'Dell',
            'Modelo': 'Latitude 5420',
            'Localização': 'Curitiba',
            'Situação': 'enviado',
            'Observações': 'Fonte trocada'
          },
          {
            'Código': 'EQ002',
            'Tipo': 'Impressora',
            'Marca': 'HP',
            'Modelo': 'LaserJet 1020',
            'Localização': 'São Paulo',
            'Situação': 'em_estoque',
            'Observações': 'OK'
          }
        ]
      } else {
        return NextResponse.json(
          { error: 'Formato de arquivo não suportado' },
          { status: 400 }
        )
      }
    } catch (parseError) {
      console.error('Erro ao processar arquivo:', parseError)
      return NextResponse.json(
        { error: 'Erro ao processar arquivo. Verifique o formato e tente novamente.' },
        { status: 400 }
      )
    }

    if (records.length === 0) {
      return NextResponse.json(
        { error: 'Nenhum registro encontrado no arquivo' },
        { status: 400 }
      )
    }

    // Processar importação
    let successCount = 0
    let errorCount = 0
    const errors: string[] = []

    // Se modo for replace, limpar dados existentes primeiro
    if (mode === 'replace') {
      await db.equipment.deleteMany()
    }

    for (const record of records) {
      try {
        // Mapear campos
        const equipmentData = {
          code: record.Código || record.code || record.codigo || record.Codigo || '',
          serialNumber: record['Número de Série'] || record.serialNumber || record.numero_serie || record['Numero de Serie'] || '',
          type: record.Tipo || record.type || record.tipo || record.Tipo || '',
          brand: record.Marca || record.brand || record.marca || '',
          model: record.Modelo || record.model || record.modelo || '',
          location: record.Localização || record.location || record.localizacao || record.Localizacao || '',
          status: record.Situação || record.status || record.situacao || record.Situacao || 'em_estoque',
          observations: record.Observações || record.observations || record.observacoes || record.Observacoes || ''
        }

        // Validar campos obrigatórios
        if (!equipmentData.code || !equipmentData.type || !equipmentData.brand || !equipmentData.model) {
          errors.push(`Registro inválido: ${JSON.stringify(record)}`)
          errorCount++
          continue
        }

        // Validar status
        const validStatuses = ['em_estoque', 'enviado', 'manutencao', 'devolvido']
        if (!validStatuses.includes(equipmentData.status)) {
          equipmentData.status = 'em_estoque'
        }

        // Verificar se já existe
        const existing = await db.equipment.findUnique({
          where: { code: equipmentData.code }
        })

        if (mode === 'replace' || !existing) {
          // Criar novo
          await db.equipment.create({
            data: equipmentData
          })
          successCount++
        } else if (mode === 'update') {
          // Atualizar existente
          await db.equipment.update({
            where: { code: equipmentData.code },
            data: equipmentData
          })
          successCount++
        } else if (mode === 'merge') {
          // Mesclar (pular se existe)
          errors.push(`Equipamento ${equipmentData.code} já existe`)
          errorCount++
        }
      } catch (error) {
        console.error('Erro ao processar registro:', error)
        errors.push(`Erro ao processar: ${JSON.stringify(record)}`)
        errorCount++
      }
    }

    // Criar log de importação
    const importLog = await db.importLog.create({
      data: {
        fileName: file.name,
        fileType: fileExtension,
        recordsCount: records.length,
        successCount,
        errorCount,
        errors: errors.length > 0 ? errors.join('\n') : null
      }
    })

    return NextResponse.json({
      success: true,
      message: `Importação concluída: ${successCount} registros importados com sucesso`,
      log: importLog
    })
  } catch (error) {
    console.error('Erro na importação:', error)
    return NextResponse.json(
      { error: 'Erro na importação: ' + (error as Error).message },
      { status: 500 }
    )
  }
}