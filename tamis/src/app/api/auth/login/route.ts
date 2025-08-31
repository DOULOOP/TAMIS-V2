import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { db } from '@/server/db';
import { env } from '@/env';

const JWT_SECRET = new TextEncoder().encode(env.JWT_SECRET);

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'E-posta ve şifre gereklidir' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        name: true,
        role: true,
        department: true,
        isActive: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Geçersiz e-posta veya şifre' },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { message: 'Hesabınız devre dışı bırakılmış' },
        { status: 401 }
      );
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Geçersiz e-posta veya şifre' },
        { status: 401 }
      );
    }

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    // Create JWT token
    const token = await new SignJWT({ 
      userId: user.id, 
      email: user.email,
      role: user.role 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
    };

    return NextResponse.json({
      message: 'Giriş başarılı',
      user: userResponse,
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Sunucu hatası' },
      { status: 500 }
    );
  }
}
