import asyncio
from sqlalchemy import text
from app.core.database import engine
import bcrypt

async def create_admin():
    password = 'admin2020'
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    async with engine.begin() as conn:
        # Verificar se já existe
        result = await conn.execute(
            text("SELECT email FROM admin_users WHERE email = 'admin@karegaaki.co.mz'")
        )
        existing = result.scalar_one_or_none()

        if existing:
            print('Admin já existe!')
            return

        # Criar admin
        await conn.execute(
            text("""
                INSERT INTO admin_users (email, password_hash, full_name, role, is_active, id, created_at, updated_at)
                VALUES (
                    'admin@karegaaki.co.mz',
                    :password_hash,
                    'Administrador KaregaAki',
                    'super_admin',
                    true,
                    gen_random_uuid(),
                    NOW(),
                    NOW()
                )
            """),
            {'password_hash': password_hash}
        )

        print('Admin criado com sucesso!')
        print('Email: admin@karegaaki.co.mz')
        print('Senha: admin2020')

asyncio.run(create_admin())