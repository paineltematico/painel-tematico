import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

const FROM = process.env.RESEND_FROM_EMAIL ?? 'Painel Temático <noreply@paineltematico.pt>'
const ADMIN = process.env.RESEND_TO_ADMIN ?? 'geral@paineltematico.pt'

export async function sendEmail(to: string, subject: string, html: string) {
  if (!resend) {
    console.log('[email] RESEND_API_KEY not set — skipping:', subject)
    return { ok: false, reason: 'no_key' }
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, html })
    return { ok: true }
  } catch (e) {
    console.error('[email] send error:', e)
    return { ok: false, reason: String(e) }
  }
}

export async function sendAdminEmail(subject: string, html: string) {
  return sendEmail(ADMIN, subject, html)
}

/* ─── Email templates ─── */

export function emailConfirmacao(nome: string, tipo: string, cidade: string): string {
  return `
<!DOCTYPE html>
<html lang="pt">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Pedido de Avaliação Recebido</title></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr><td style="background:#1F3F44;padding:40px;text-align:center;">
          <p style="color:#4ecdc4;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:0 0 12px;">Painel Temático</p>
          <h1 style="color:#fff;font-size:26px;margin:0;font-weight:700;">Recebemos o seu pedido!</h1>
          <p style="color:rgba(255,255,255,0.7);margin:12px 0 0;font-size:15px;">A nossa equipa já está a analisar o seu imóvel</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:40px;">
          <p style="color:#1F3F44;font-size:16px;margin:0 0 20px;">Olá <strong>${nome}</strong>,</p>
          <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 24px;">
            Recebemos o seu pedido de avaliação gratuita para o seu <strong>${tipo}</strong> em <strong>${cidade}</strong>.
            A nossa equipa especializada vai estudar o mercado local e preparar uma análise detalhada para si.
          </p>
          <!-- Info box -->
          <div style="background:#f8fafc;border-left:4px solid #00545F;border-radius:0 8px 8px 0;padding:20px;margin:0 0 28px;">
            <p style="color:#1F3F44;font-weight:700;margin:0 0 8px;font-size:14px;">O que acontece a seguir:</p>
            <ol style="color:#475569;font-size:14px;line-height:1.8;margin:0;padding-left:20px;">
              <li>A nossa equipa analisa os dados que partilhou</li>
              <li>Podemos contactá-lo para esclarecer alguns detalhes</li>
              <li>Preparamos um estudo de mercado personalizado</li>
              <li>Apresentamos a nossa proposta de avaliação</li>
            </ol>
          </div>
          <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 32px;">
            Normalmente respondemos em <strong>24 a 48 horas</strong>. Se tiver alguma questão urgente,
            não hesite em contactar-nos pelo +351 913 440 800.
          </p>
          <div style="text-align:center;">
            <a href="https://painel-tematico.vercel.app/imoveis"
               style="display:inline-block;background:#00545F;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">
              Ver os nossos imóveis
            </a>
          </div>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#f8fafc;padding:24px 40px;border-top:1px solid #e2e8f0;text-align:center;">
          <p style="color:#94a3b8;font-size:12px;margin:0;">Painel Temático · Braga, Portugal · AMI 25031</p>
          <p style="color:#94a3b8;font-size:12px;margin:8px 0 0;">
            <a href="https://painel-tematico.vercel.app" style="color:#00545F;text-decoration:none;">painel-tematico.vercel.app</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

export function emailFollowUp1(nome: string, tipo: string, cidade: string, avaliacaoId: string): string {
  return `
<!DOCTYPE html>
<html lang="pt">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:#1F3F44;padding:40px;text-align:center;">
          <p style="color:#4ecdc4;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:0 0 12px;">Painel Temático</p>
          <h1 style="color:#fff;font-size:24px;margin:0;font-weight:700;">Temos algumas dúvidas 🔍</h1>
          <p style="color:rgba(255,255,255,0.7);margin:12px 0 0;font-size:15px;">Para uma análise mais precisa do seu imóvel</p>
        </td></tr>
        <tr><td style="padding:40px;">
          <p style="color:#1F3F44;font-size:16px;margin:0 0 20px;">Olá <strong>${nome}</strong>,</p>
          <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 24px;">
            A nossa equipa está a preparar a avaliação do seu <strong>${tipo}</strong> em <strong>${cidade}</strong>
            e gostaríamos de complementar a análise com algumas informações adicionais.
          </p>
          <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:12px;padding:24px;margin:0 0 28px;">
            <p style="color:#92400e;font-weight:700;margin:0 0 12px;font-size:15px;">📸 Pode enviar algumas fotografias?</p>
            <p style="color:#92400e;font-size:14px;line-height:1.7;margin:0 0 16px;">
              Fotografias do interior e exterior ajudam-nos a fazer uma avaliação muito mais precisa
              e a identificar os pontos fortes do seu imóvel para a estratégia de venda.
            </p>
            <p style="color:#92400e;font-size:13px;margin:0;">
              <strong>O que fotografar:</strong> Salas, quartos, cozinha, casas de banho, exteriores, vistas e zonas de destaque
            </p>
          </div>
          <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:24px;margin:0 0 28px;">
            <p style="color:#166534;font-weight:700;margin:0 0 12px;font-size:15px;">📄 Documentação útil (opcional)</p>
            <ul style="color:#166534;font-size:14px;line-height:1.8;margin:0;padding-left:20px;">
              <li>Caderneta predial urbana</li>
              <li>Certidão de teor (registo predial)</li>
              <li>Certificado energético (se tiver)</li>
              <li>Plantas do imóvel</li>
            </ul>
          </div>
          <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 32px;">
            Pode responder diretamente a este email com as fotos e documentos, ou contactar-nos pelo WhatsApp
            <strong>+351 913 440 800</strong>. Com estes elementos, conseguimos oferecer-lhe um
            <strong>estudo de mercado muito mais completo e personalizado</strong>.
          </p>
          <div style="text-align:center;">
            <a href="mailto:geral@paineltematico.pt?subject=Avaliação ${avaliacaoId} - Fotografias"
               style="display:inline-block;background:#00545F;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">
              Responder com fotografias
            </a>
          </div>
        </td></tr>
        <tr><td style="background:#f8fafc;padding:24px 40px;border-top:1px solid #e2e8f0;text-align:center;">
          <p style="color:#94a3b8;font-size:12px;margin:0;">Painel Temático · Braga, Portugal · AMI 25031</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

export function emailFollowUp2(nome: string, tipo: string, cidade: string): string {
  return `
<!DOCTYPE html>
<html lang="pt">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr><td style="background:#00545F;padding:40px;text-align:center;">
          <p style="color:#4ecdc4;font-size:11px;letter-spacing:3px;text-transform:uppercase;margin:0 0 12px;">Painel Temático</p>
          <h1 style="color:#fff;font-size:24px;margin:0;font-weight:700;">O seu estudo de mercado está quase pronto ✅</h1>
          <p style="color:rgba(255,255,255,0.7);margin:12px 0 0;font-size:15px;">Só precisamos de mais um detalhe</p>
        </td></tr>
        <tr><td style="padding:40px;">
          <p style="color:#1F3F44;font-size:16px;margin:0 0 20px;">Olá <strong>${nome}</strong>,</p>
          <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 24px;">
            A nossa análise do mercado para o seu <strong>${tipo}</strong> em <strong>${cidade}</strong>
            está praticamente concluída. Identificámos imóveis comparáveis na zona e temos dados
            muito interessantes para partilhar consigo.
          </p>
          <div style="background:#f8fafc;border-radius:12px;padding:24px;margin:0 0 28px;border:1px solid #e2e8f0;">
            <p style="color:#1F3F44;font-weight:700;margin:0 0 16px;font-size:15px;">Para finalizar a sua avaliação, gostaríamos de saber:</p>
            <ol style="color:#475569;font-size:14px;line-height:2;margin:0;padding-left:20px;">
              <li>Qual é o <strong>prazo ideal</strong> para si concluir a venda?</li>
              <li>Já fez obras ou melhorias recentes no imóvel?</li>
              <li>O imóvel está atualmente <strong>ocupado ou disponível</strong> para visitas?</li>
              <li>Tem preferência por como pretende receber a nossa proposta — reunião presencial, videochamada ou por email?</li>
            </ol>
          </div>
          <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 12px;">
            Pode simplesmente <strong>responder a este email</strong> com as suas respostas.
            Assim que tivermos estas informações, enviamos-lhe o estudo de mercado completo
            com a nossa avaliação e sugestão de estratégia de venda.
          </p>
          <p style="color:#475569;font-size:15px;line-height:1.7;margin:0 0 32px;">
            Estamos aqui para si. Não hesite em ligar para <strong>+351 913 440 800</strong>
            se preferir falar diretamente com um dos nossos especialistas.
          </p>
          <div style="text-align:center;">
            <a href="mailto:geral@paineltematico.pt?subject=Resposta - Estudo de Mercado"
               style="display:inline-block;background:#1F3F44;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">
              Responder ao estudo
            </a>
          </div>
        </td></tr>
        <tr><td style="background:#f8fafc;padding:24px 40px;border-top:1px solid #e2e8f0;text-align:center;">
          <p style="color:#94a3b8;font-size:12px;margin:0;">Painel Temático · Braga, Portugal · AMI 25031</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

function escapeHtml(v: unknown): string {
  return String(v ?? '—')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function emailAdminNovoLead(data: Record<string, unknown>): string {
  const rows = Object.entries(data).map(([k, v]) =>
    `<tr><td style="padding:6px 12px;color:#64748b;font-size:13px;border-bottom:1px solid #f1f5f9;">${k}</td>
     <td style="padding:6px 12px;color:#1F3F44;font-size:13px;font-weight:600;border-bottom:1px solid #f1f5f9;">${escapeHtml(v)}</td></tr>`
  ).join('')
  return `
<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f1f5f9;padding:20px;">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;">
  <div style="background:#1F3F44;padding:24px;"><h2 style="color:#fff;margin:0;">📩 Novo Contacto Recebido</h2></div>
  <div style="padding:24px;">
    <table width="100%" cellpadding="0" cellspacing="0">${rows}</table>
    <div style="margin-top:20px;text-align:center;">
      <a href="https://painel-tematico.vercel.app/admin/leads"
         style="background:#00545F;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;">
        Ver no CRM
      </a>
    </div>
  </div>
</div>
</body></html>`
}

export function emailAdminNovaAvaliacao(data: Record<string, unknown>): string {
  const rows = Object.entries(data).map(([k, v]) =>
    `<tr><td style="padding:6px 12px;color:#64748b;font-size:13px;border-bottom:1px solid #f1f5f9;">${k}</td>
     <td style="padding:6px 12px;color:#1F3F44;font-size:13px;font-weight:600;border-bottom:1px solid #f1f5f9;">${escapeHtml(v)}</td></tr>`
  ).join('')
  return `
<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f1f5f9;padding:20px;">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;">
  <div style="background:#1F3F44;padding:24px;"><h2 style="color:#fff;margin:0;">🏠 Nova Avaliação Recebida</h2></div>
  <div style="padding:24px;">
    <table width="100%" cellpadding="0" cellspacing="0">${rows}</table>
    <div style="margin-top:20px;text-align:center;">
      <a href="https://painel-tematico.vercel.app/admin/avaliacoes"
         style="background:#00545F;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:700;">
        Ver no painel
      </a>
    </div>
  </div>
</div>
</body></html>`
}
