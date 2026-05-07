import nodemailer from 'nodemailer'

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export async function sendOrderConfirmationEmail({
  to,
  order,
}: {
  to: string
  order: any
}) {
  const transporter = getTransporter()

  const itemsText = order.items
    ?.map(
      (item: any) =>
        `- ${item.nameFr || item.nameEn} x${item.quantity} — ${item.price} ${order.currency || 'CAD'}`
    )
    .join('\n')

  await transporter.sendMail({
    from: `"CosmoChain 360" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to,
    subject: `Confirmation de commande ${order.orderNumber}`,
    text: `
Bonjour,

Merci pour votre commande ${order.orderNumber}.

Résumé :
${itemsText || 'Aucun article'}

Sous-total : ${order.subtotal} ${order.currency || 'CAD'}
TPS : ${order.gst} ${order.currency || 'CAD'}
TVQ : ${order.pst} ${order.currency || 'CAD'}
Livraison : ${order.shippingCost} ${order.currency || 'CAD'}
Total : ${order.total} ${order.currency || 'CAD'}

Adresse de livraison :
${order.shippingAddress?.firstName || ''} ${order.shippingAddress?.lastName || ''}
${order.shippingAddress?.street || ''}
${order.shippingAddress?.city || ''}, ${order.shippingAddress?.province || ''}
${order.shippingAddress?.postalCode || ''}
${order.shippingAddress?.country || ''}

Conformément aux exigences du commerce en ligne au Québec, ce courriel constitue une confirmation de votre commande.

Pour toute question : ${process.env.SUPPORT_EMAIL || 'support@cosmochain360.ca'}

CosmoChain 360
`.trim(),
  })
}

export async function sendMarketingEmail({
  to,
  subject,
  message,
}: {
  to: string
  subject: string
  message: string
}) {
  const transporter = getTransporter()

  await transporter.sendMail({
    from: `"CosmoChain 360" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to,
    subject,
    text: `
${message}

---
Vous recevez ce message parce que vous avez consenti aux communications marketing de CosmoChain 360.

Pour vous désabonner, connectez-vous à votre compte et désactivez le consentement marketing.

CosmoChain 360
${process.env.SUPPORT_EMAIL || 'support@cosmochain360.ca'}
`.trim(),
  })
}