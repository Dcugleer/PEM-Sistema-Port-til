import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production')

// Middleware para verificar se é admin
async function isAdmin(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  if (!token) return false

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload.role === 'ADMIN'
  } catch {
    return false
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const users = await db.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar usuários' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const { name, username, email, password, role } = await request.json()

    // Validações
    if (!name || !username || !password) {
      return NextResponse.json(
        { error: 'Nome, usuário e senha são obrigatórios' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      )
    }

    // Verificar se usuário já existe
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Usuário ou e-mail já cadastrado' },
        { status: 400 }
      )
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(password, 10)

    // Criar usuário
    const user = await db.user.create({
      data: {
        name,
        username,
        email,
        passwordHash,
        role: role || 'OPERATOR'
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    })

    // Criar log de auditoria
    const token = request.cookies.get('auth-token')?.value
    if (token) {
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET)
        
        await db.auditLog.create({
          data: {
            userId: payload.userId as string,
            action: 'CREATE_USER',
            entity: 'user',
            entityId: user.id,
            newValues: JSON.stringify({
              name,
              username,
              email,
              role
            }),
            ipAddress: request.ip || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown'
          }
        })
      } catch (error) {
        console.error('Erro ao criar log de auditoria:', error)
      }
    }

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    return NextResponse.json(
      { error: 'Erro ao criar usuário' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    const { name, username, email, role, isActive } = await request.json()

    // Validações
    if (!name || !username) {
      return NextResponse.json(
        { error: 'Nome e usuário são obrigatórios' },
        { status: 400 }
      )
    }

    if (role && !['ADMIN', 'OPERATOR', 'VIEWER'].includes(role)) {
      return NextResponse.json(
        { error: 'Nível de acesso inválido' },
        { status: 400 }
      )
    }

    // Verificar se usuário existe (exceto o próprio)
    const existingUser = await db.user.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ],
        NOT: { id: params.id }
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Usuário ou e-mail já cadastrado' },
        { status: 400 }
      )
    }

    // Hash da senha se fornecida
    let updateData: any = {
      name,
      username,
      email,
      role,
      updatedAt: new Date()
    }

    if (password && password.trim() !== '') {
      updateData.passwordHash = await bcrypt.hash(password, 10)
    }

    // Atualizar usuário
    const updatedUser = await db.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        isActive: isActive !== undefined ? isActive : true,
        createdAt: true,
        updatedAt: true
      }
    })

    // Criar log de auditoria
    const token = request.cookies.get('auth-token')?.value
    if (token) {
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET)
        
        await db.auditLog.create({
          data: {
            userId: payload.userId as string,
            action: 'UPDATE_USER',
            entity: 'user',
            entityId: params.id,
            oldValues: JSON.stringify(existingUser),
            newValues: JSON.stringify(updateData),
            ipAddress: request.ip || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown'
          }
        })
      } catch (error) {
        console.error('Erro ao criar log de auditoria:', error)
      }
    }

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar usuário' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    if (!(await isAdmin(request))) {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    // Verificar se usuário existe
    const user = await db.user.findUnique({
      where: { id: params.id }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Não permitir excluir a si mesmo
    const token = request.cookies.get('auth-token')?.value
    if (token) {
      try {
        const { payload } = await jwtVerify(token, JWT_SECRET)
        
        if (payload.userId === params.id) {
          return NextResponse.json(
            { error: 'Não é permitido excluir o próprio usuário' },
            { status: 400 }
          )
        }
      } catch (error) {
        console.error('Erro ao verificar token:', error)
      }
    }

    // Verificar se usuário tem remessas ativas
    const activeShipments = await db.shipmentEquipment.count({
      where: {
        equipment: {
          createdBy: params.id
        },
        shipment: {
          status: 'enviado'
        }
      }
    })

    if (activeShipments > 0) {
      return NextResponse.json(
        { error: 'Não é permitido excluir usuário com remessas ativas' },
        { status: 400 }
      )
    }

    // Desativar usuário em vez de excluir
    const deactivatedUser = await db.user.update({
      where: { id: params.id },
      data: {
        isActive: false,
        updatedAt: new Date()
      }
    })

    // Criar log de auditoria
    const auditToken = request.cookies.get('auth-token')?.value
    if (auditToken) {
      try {
        const { payload } = await jwtVerify(auditToken, JWT_SECRET)
        
        await db.auditLog.create({
          data: {
            userId: payload.userId as string,
            action: 'DEACTIVATE_USER',
            entity: 'user',
            entityId: params.id,
            oldValues: JSON.stringify(user),
            newValues: JSON.stringify({ isActive: false }),
            ipAddress: request.ip || 'unknown',
            userAgent: request.headers.get('user-agent') || 'unknown'
          }
        })
      } catch (error) {
        console.error('Erro ao criar log de auditoria:', error)
      }
    }

    return NextResponse.json(
      { message: 'Usuário desativado com sucesso' }
    )
  } catch (error) {
    console.error('Erro ao excluir usuário:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir usuário' },
      { status: 500 }
    )
  }
}