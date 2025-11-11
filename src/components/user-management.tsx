'use client'


"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings, User } from "lucide-react"

interface User {
  id: string
  name: string
  username: string
  email?: string
  role: "ADMIN" | "OPERATOR" | "VIEWER"
  lastLogin?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  permissions: string[]
}

interface UserManagementProps {
  user: User
}

function formatDate(dateString?: string) {
  if (!dateString) return ""
  const date = new Date(dateString)
  return date.toLocaleDateString("pt-BR")
}

function getRoleLabel(role: User["role"]) {
  switch (role) {
    case "ADMIN": return "Administrador"
    case "OPERATOR": return "Operador"
    case "VIEWER": return "Visualizador"
    default: return "Desconhecido"
  }
}

function getRoleColor(role: User["role"]) {
  switch (role) {
    case "ADMIN": return "destructive"
    case "OPERATOR": return "default"
    case "VIEWER": return "secondary"
    default: return "default"
  }
}

export function UserManagement({ user }: UserManagementProps) {
  // Dados fictícios para estatísticas
  const stats = {
    totalUsers: 10,
    activeUsers: 7,
    inactiveUsers: 2,
    returnedUsers: 1,
  }

  // Dados fictícios para logs
  const logs = [
    { id: "1", date: "2024-01-01", action: "LOGIN", user: "João Silva", description: "Login realizado" },
    { id: "2", date: "2024-01-15", action: "CREATE_USER", user: "Maria Santos", description: "Novo usuário criado" },
    { id: "3", date: "2024-01-20", action: "EDIT_USER", user: "João Silva", description: "Dados atualizados" },
  ]

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">🚚 PEM - Sistema Portátil de Envio</h1>
            <p className="text-muted-foreground mt-1">Gerenciamento completo de equipamentos e remessas</p>
          </div>
          <div className="flex gap-2 items-center">
            {/* <UserMenu /> */}
          </div>
        </div>

        {/* Main Content Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Usuários</CardTitle>
              <CardDescription>Criação e administração de usuários do sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <User className="w-16 h-16 rounded-full bg-gray-100 mx-auto mb-2" />
                    <div className="text-lg font-medium">{user.name}</div>
                    <div className="text-xs text-muted-foreground">{user.username}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-right">
                    <Badge variant={getRoleColor(user.role)} className="text-white text-xs">
                      {getRoleLabel(user.role)}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Gerenciar Usuários
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Estatísticas dos Usuários</CardTitle>
              <CardDescription>Visão geral do sistema e atividades dos usuários</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.activeUsers}</div>
                  <div className="text-xs text-muted-foreground">usuários ativos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.inactiveUsers}</div>
                  <div className="text-xs text-muted-foreground">usuários inativos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">{stats.returnedUsers}</div>
                  <div className="text-xs text-muted-foreground">usuários devolvidos</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{stats.totalUsers}</div>
                  <div className="text-xs text-muted-foreground">total de usuários</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
              <CardDescription>Logs de Auditoria</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {logs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-muted-foreground">{formatDate(log.date)}</div>
                      <div className="text-xs text-muted-foreground">{log.action}</div>
                      <div className="text-xs text-muted-foreground">{log.user}</div>
                      <div className="text-xs text-muted-foreground">{log.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}