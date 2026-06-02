#!/usr/bin/env node
/**
 * Criar o primeiro utilizador super_admin
 *
 * Uso: node scripts/create-admin.mjs
 *
 * Requer que o servidor esteja a correr: npm run dev
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001'

const user = {
  nome:     'Hugo Carrinho',
  email:    'hugoapfcarrinho@gmail.com',
  password: 'paineltematico2025', // Mude após o primeiro login!
}

console.log(`\n🔐 Criar Super Admin\n`)
console.log(`   Nome:  ${user.nome}`)
console.log(`   Email: ${user.email}\n`)

try {
  const res = await fetch(`${BASE_URL}/api/admin/login`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user),
  })

  const data = await res.json()

  if (res.status === 409) {
    console.log('ℹ️  Já existem utilizadores na base de dados.')
    console.log('   Para adicionar mais utilizadores, aceda ao painel: /admin/utilizadores\n')
    process.exit(0)
  }

  if (!res.ok) {
    console.error(`❌ Erro ${res.status}: ${data.error}`)
    process.exit(1)
  }

  console.log('✅ Super Admin criado com sucesso!\n')
  console.log(`   Pode agora entrar em: ${BASE_URL}/admin/login`)
  console.log(`   Email:    ${data.user.email}`)
  console.log(`   Função:   Super Admin`)
  console.log(`\n⚠️  Mude a password após o primeiro login!\n`)

} catch (err) {
  console.error('\n❌ Não foi possível ligar ao servidor.')
  console.error('   Certifique-se que "npm run dev" está a correr.\n')
  process.exit(1)
}
