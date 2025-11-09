'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Upload, Download, FileSpreadsheet, FileText, Database, CheckCircle, AlertCircle } from 'lucide-react'

interface ImportLog {
  id: string
  fileName: string
  fileType: string
  recordsCount: number
  successCount: number
  errorCount: number
  errors?: string
  createdAt: string
}

export function ImportExport() {
  const [importLogs, setImportLogs] = useState<ImportLog[]>([])
  const [importing, setImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importMode, setImportMode] = useState<'replace' | 'merge' | 'update'>('merge')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const validTypes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv',
        'application/json',
        'text/plain'
      ]
      
      if (validTypes.includes(file.type) || file.name.endsWith('.csv') || file.name.endsWith('.json') || file.name.endsWith('.txt')) {
        setSelectedFile(file)
      } else {
        alert('Tipo de arquivo não suportado. Selecione Excel, CSV, JSON ou TXT.')
      }
    }
  }

  const handleImport = async () => {
    if (!selectedFile) return

    setImporting(true)
    setImportProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('mode', importMode)

      // Simulate progress
      const progressInterval = setInterval(() => {
        setImportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      setImportProgress(100)

      if (response.ok) {
        const result = await response.json()
        setImportLogs(prev => [result.log, ...prev])
        setSelectedFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        
        // Show success message
        alert(`✅ Importação concluída com sucesso!\n\n${result.message}`)
      } else {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || 'Erro desconhecido'
        alert(`❌ Erro na importação: ${errorMessage}`)
      }
    } catch (error) {
      console.error('Erro na importação:', error)
      alert(`❌ Erro na importação: ${error instanceof Error ? error.message : 'Tente novamente.'}`)
    } finally {
      setImporting(false)
      setTimeout(() => setImportProgress(0), 2000)
    }
  }

  const handleExport = async (format: 'csv' | 'excel' | 'json') => {
    try {
      const response = await fetch(`/api/export?format=${format}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `equipamentos_${new Date().toISOString().split('T')[0]}.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        
        // Show success message
        alert(`✅ Exportação concluída com sucesso!\n\nArquivo ${format.toUpperCase()} baixado com sucesso.`)
      } else {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || 'Erro desconhecido'
        alert(`❌ Erro na exportação: ${errorMessage}`)
      }
    } catch (error) {
      console.error('Erro na exportação:', error)
      alert(`❌ Erro na exportação: ${error instanceof Error ? error.message : 'Tente novamente.'}`)
    }
  }

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      return <FileSpreadsheet className="w-4 h-4 text-green-600" />
    } else if (fileName.endsWith('.csv')) {
      return <FileText className="w-4 h-4 text-blue-600" />
    } else if (fileName.endsWith('.json')) {
      return <Database className="w-4 h-4 text-yellow-600" />
    } else {
      return <FileText className="w-4 h-4 text-gray-600" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="import" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="import">Importar Dados</TabsTrigger>
          <TabsTrigger value="export">Exportar Dados</TabsTrigger>
        </TabsList>
        
        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Importar Equipamentos</CardTitle>
              <CardDescription>
                Importe dados de planilhas Excel, CSV, JSON ou TXT para o sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="file">Selecione o arquivo</Label>
                  <Input
                    ref={fileInputRef}
                    id="file"
                    type="file"
                    accept=".xlsx,.xls,.csv,.json,.txt"
                    onChange={handleFileSelect}
                    disabled={importing}
                  />
                  <p className="text-xs text-muted-foreground">
                    Formatos suportados: Excel (.xlsx, .xls), CSV, JSON, TXT
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label>Modo de importação</Label>
                  <Select value={importMode} onValueChange={(value: any) => setImportMode(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="replace">Substituir todos os dados</SelectItem>
                      <SelectItem value="merge">Mesclar com dados existentes</SelectItem>
                      <SelectItem value="update">Atualizar registros existentes</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    {importMode === 'replace' && 'Todos os equipamentos serão substituídos'}
                    {importMode === 'merge' && 'Novos equipamentos serão adicionados'}
                    {importMode === 'update' && 'Registros existentes serão atualizados'}
                  </p>
                </div>
              </div>

              {selectedFile && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                  {getFileIcon(selectedFile.name)}
                  <span className="text-sm font-medium">{selectedFile.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              )}

              {importing && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Importando...</span>
                    <span>{importProgress}%</span>
                  </div>
                  <Progress value={importProgress} className="w-full" />
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={handleImport} 
                  disabled={!selectedFile || importing}
                  className="flex-1"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {importing ? 'Importando...' : 'Importar Dados'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedFile(null)
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                  disabled={importing}
                >
                  Limpar
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Histórico de Importações</CardTitle>
              <CardDescription>Registro das últimas importações realizadas</CardDescription>
            </CardHeader>
            <CardContent>
              {importLogs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma importação realizada ainda
                </div>
              ) : (
                <div className="space-y-3">
                  {importLogs.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {log.errorCount > 0 ? (
                          <AlertCircle className="w-5 h-5 text-yellow-500" />
                        ) : (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            {getFileIcon(log.fileName)}
                            <span className="font-medium">{log.fileName}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(log.createdAt)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">
                          {log.successCount}/{log.recordsCount}
                        </Badge>
                        {log.errorCount > 0 && (
                          <Badge variant="destructive">
                            {log.errorCount} erros
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Exportar Dados</CardTitle>
              <CardDescription>
                Exporte os dados dos equipamentos em diferentes formatos
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleExport('csv')}>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                      <FileText className="w-8 h-8 mx-auto text-blue-600" />
                      <h3 className="font-medium">CSV</h3>
                      <p className="text-sm text-muted-foreground">
                        Formato compatível com Excel e planilhas
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        <Download className="w-4 h-4 mr-2" />
                        Exportar CSV
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleExport('excel')}>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                      <FileSpreadsheet className="w-8 h-8 mx-auto text-green-600" />
                      <h3 className="font-medium">Excel</h3>
                      <p className="text-sm text-muted-foreground">
                        Planilha Excel com formatação
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        <Download className="w-4 h-4 mr-2" />
                        Exportar Excel
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleExport('json')}>
                  <CardContent className="pt-6">
                    <div className="text-center space-y-2">
                      <Database className="w-8 h-8 mx-auto text-yellow-600" />
                      <h3 className="font-medium">JSON</h3>
                      <p className="text-sm text-muted-foreground">
                        Formato estruturado para sistemas
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        <Download className="w-4 h-4 mr-2" />
                        Exportar JSON
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">📋 Estrutura de Dados Exportada</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• Código interno do equipamento</p>
                  <p>• Número de série (se aplicável)</p>
                  <p>• Tipo, marca e modelo</p>
                  <p>• Localização atual</p>
                  <p>• Situação (em estoque, enviado, manutenção, devolvido)</p>
                  <p>• Data de aquisição</p>
                  <p>• Observações e anotações</p>
                  <p>• Data de criação e atualização</p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                <h4 className="font-medium mb-2 text-blue-800">📝 Exemplo de Arquivo CSV</h4>
                <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
{`Código,Tipo,Marca,Modelo,Localização,Situação,Observações
EQ001,Notebook,Dell,Latitude 5420,São Paulo,em_estoque,Novo
EQ002,Monitor,Samsung,27" Curvo,Rio de Janeiro,enviado,Cliente`}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}