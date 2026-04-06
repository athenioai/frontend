'use server'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export async function sendCodeAction(_prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string

  if (!email) {
    return { error: 'Informe seu e-mail.' }
  }

  try {
    const res = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      if (body.error === 'TOO_MANY_REQUESTS') {
        return { error: 'Muitas tentativas. Aguarde antes de solicitar outro código.' }
      }
      throw new Error(body.message)
    }
  } catch {
    // Retorna sucesso mesmo em erro para não expor se o e-mail existe
  }

  return { success: true, email }
}

export async function resetPasswordAction(_prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string
  const code = formData.get('code') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!code || !password || !confirmPassword) {
    return { error: 'Preencha todos os campos.' }
  }

  if (password.length < 8) {
    return { error: 'A senha deve ter no mínimo 8 caracteres.' }
  }

  if (password !== confirmPassword) {
    return { error: 'As senhas não coincidem.' }
  }

  try {
    const res = await fetch(`${API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, password }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      const messages: Record<string, string> = {
        VALIDATION_ERROR: 'Código inválido ou senha muito curta.',
        NOT_FOUND: 'Código inválido ou expirado.',
        TOO_MANY_REQUESTS: 'Muitas tentativas. Aguarde antes de tentar novamente.',
      }
      return { error: messages[body.error] ?? body.message ?? 'Erro ao redefinir senha.' }
    }

    return { success: true }
  } catch {
    return { error: 'Erro ao redefinir senha. Tente novamente.' }
  }
}
