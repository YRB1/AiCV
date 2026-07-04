require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const crypto = require('crypto')

const app = express()
const PORT = process.env.PORT || 3001

// ── STRIPE ────────────────────────────────────────────────────────────────────
let stripe = null
if (process.env.STRIPE_SECRET_KEY) {
  const Stripe = require('stripe')
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
}

// ── SUPABASE (service role — server-side only) ────────────────────────────────
let supabase = null
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  const { createClient } = require('@supabase/supabase-js')
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

// ── WEBHOOK needs raw body — must come BEFORE express.json() ─────────────────
app.post('/api/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  if (!stripe) return res.status(503).json({ error: 'Stripe not configured' })

  const sig = req.headers['stripe-signature']
  let event
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return res.status(400).json({ error: 'Webhook signature invalid' })
  }

  if (supabase) {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      const { userId, plan } = session.metadata || {}
      if (userId && plan) {
        await supabase.from('profiles').update({
          subscription_tier: plan,
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          subscription_status: 'active',
        }).eq('user_id', userId)
      }
    }

    if (event.type === 'customer.subscription.deleted') {
      const sub = event.data.object
      const userId = sub.metadata?.userId
      if (userId) {
        await supabase.from('profiles').update({
          subscription_tier: 'free',
          subscription_status: 'cancelled',
        }).eq('user_id', userId)
      }
    }

    if (event.type === 'customer.subscription.updated') {
      const sub = event.data.object
      const { userId, plan } = sub.metadata || {}
      if (userId) {
        await supabase.from('profiles').update({
          subscription_tier: plan || 'free',
          subscription_status: sub.status,
        }).eq('user_id', userId)
      }
    }
  }

  res.json({ received: true })
})

// ── MIDDLEWARE ────────────────────────────────────────────────────────────────
const origins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(s => s.trim())
  : true // allow all in dev

app.use(cors({ origin: origins, credentials: true }))
app.use(express.json())

// Serve website/ as static files
app.use(express.static(path.join(__dirname, '../website')))

// ── STRIPE: CREATE CHECKOUT SESSION ──────────────────────────────────────────
app.post('/api/stripe/checkout', async (req, res) => {
  if (!stripe) return res.status(503).json({ error: 'Stripe not configured — add STRIPE_SECRET_KEY to .env' })

  const { plan, userId, email } = req.body
  const PRICE_IDS = {
    pro:     process.env.STRIPE_PRICE_PRO,
    student: process.env.STRIPE_PRICE_STUDENT,
  }
  const priceId = PRICE_IDS[plan]
  if (!priceId) return res.status(400).json({ error: `No price ID configured for plan: ${plan}` })

  try {
    let customerId
    if (supabase && userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_customer_id')
        .eq('user_id', userId)
        .single()
      customerId = profile?.stripe_customer_id || undefined
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer: customerId,
      customer_email: customerId ? undefined : (email || undefined),
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.APP_URL || 'http://localhost:3000'}/dashboard?upgraded=true`,
      cancel_url:  `${process.env.WEBSITE_URL || 'http://localhost:3001'}/#pricing`,
      metadata: { userId: userId || '', plan },
      subscription_data: { metadata: { userId: userId || '', plan } },
    })

    res.json({ url: session.url })
  } catch (err) {
    console.error('Stripe checkout error:', err.message)
    res.status(500).json({ error: 'Failed to create checkout session' })
  }
})

// ── STUDENT VERIFICATION: SEND EMAIL ─────────────────────────────────────────
app.post('/api/auth/verify-student', async (req, res) => {
  const { studentEmail, userId } = req.body

  if (!studentEmail || !userId) {
    return res.status(400).json({ error: 'Missing studentEmail or userId' })
  }

  const isStudentEmail = studentEmail.endsWith('.ac.uk') || studentEmail.endsWith('.edu')
    || studentEmail.includes('.ac.') // e.g. .ac.nz, .ac.za
  if (!isStudentEmail) {
    return res.status(400).json({ error: 'Please use a university email (.ac.uk or .edu)' })
  }

  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()

  if (supabase) {
    await supabase.from('student_verifications').upsert({
      user_id: userId,
      student_email: studentEmail,
      token,
      expires_at: expiresAt,
      verified: false,
    }, { onConflict: 'user_id' })
  }

  // Send verification email via Resend
  if (process.env.RESEND_API_KEY) {
    const verifyUrl = `${process.env.WEBSITE_URL || 'http://localhost:3001'}/api/auth/verify-student/confirm?token=${token}&userId=${encodeURIComponent(userId)}`

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'ApplyFlow AI <noreply@applyflow.ai>',
        to: studentEmail,
        subject: 'Verify your student email — ApplyFlow AI',
        html: `
          <div style="font-family:Inter,sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#000;color:#f0f0f0;border-radius:12px">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px">
              <div style="width:32px;height:32px;background:linear-gradient(135deg,#fff,#888);border-radius:8px;display:flex;align-items:center;justify-content:center">
                <span style="font-weight:900;font-size:14px;color:#000">A</span>
              </div>
              <span style="font-weight:800;font-size:18px">ApplyFlow AI</span>
            </div>
            <h1 style="font-size:22px;font-weight:800;margin-bottom:8px;color:#f0f0f0">Verify your student email</h1>
            <p style="color:#787878;margin-bottom:24px;line-height:1.6">Click the button below to verify your university email and unlock the Student plan at <strong style="color:#f0f0f0">£15/month</strong>.</p>
            <a href="${verifyUrl}" style="display:inline-block;padding:13px 28px;background:linear-gradient(135deg,#fff,#888);color:#000;font-weight:700;font-size:15px;border-radius:10px;text-decoration:none">
              Verify Student Email →
            </a>
            <p style="color:#444;font-size:12px;margin-top:28px;line-height:1.5">This link expires in 24 hours. If you didn't request this, you can safely ignore this email.</p>
            <hr style="border:none;border-top:1px solid #222;margin:24px 0"/>
            <p style="color:#333;font-size:11px">ApplyFlow AI Ltd · <a href="https://applyflow.ai" style="color:#555">applyflow.ai</a></p>
          </div>
        `,
      }),
    }).catch(err => console.error('Resend error:', err.message))
  } else {
    console.log('[student-verify] RESEND_API_KEY not set — skipping email. Token:', token)
  }

  res.json({ success: true })
})

// ── STUDENT VERIFICATION: CONFIRM LINK ───────────────────────────────────────
app.get('/api/auth/verify-student/confirm', async (req, res) => {
  const { token, userId } = req.query

  if (!token || !userId) {
    return res.status(400).send(errorPage('Invalid verification link', 'This link is missing required parameters.'))
  }

  if (!supabase) {
    return res.status(503).send(errorPage('Service unavailable', 'Database not configured.'))
  }

  const { data } = await supabase
    .from('student_verifications')
    .select('*')
    .eq('user_id', userId)
    .eq('token', token)
    .single()

  if (!data) {
    return res.status(404).send(errorPage('Link not found', 'This verification link is invalid or has already been used.'))
  }

  if (new Date(data.expires_at) < new Date()) {
    return res.status(410).send(errorPage('Link expired', 'This verification link has expired. Please request a new one from your profile page.'))
  }

  if (data.verified) {
    return res.redirect(`${process.env.APP_URL || 'http://localhost:3000'}/dashboard?student_verified=already`)
  }

  await supabase.from('student_verifications').update({ verified: true }).eq('user_id', userId)
  await supabase.from('profiles').update({
    student_email: data.student_email,
    student_verified: true,
    is_student: true,
    subscription_tier: 'student',
    subscription_status: 'active',
  }).eq('user_id', userId)

  res.redirect(`${process.env.APP_URL || 'http://localhost:3000'}/dashboard?student_verified=true`)
})

// ── GITHUB OAUTH: SERVER-SIDE CODE EXCHANGE ───────────────────────────────────
// Only needed if you're NOT using Supabase's built-in GitHub OAuth provider
app.post('/api/auth/github/callback', async (req, res) => {
  const { code } = req.body
  if (!code) return res.status(400).json({ error: 'Missing code' })
  if (!process.env.GITHUB_CLIENT_SECRET) {
    return res.status(503).json({ error: 'GITHUB_CLIENT_SECRET not configured' })
  }

  try {
    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    })
    const tokenData = await tokenRes.json()
    if (tokenData.error) return res.status(400).json({ error: tokenData.error_description })

    const [userRes, emailRes] = await Promise.all([
      fetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${tokenData.access_token}`, 'User-Agent': 'ApplyFlow-AI' },
      }),
      fetch('https://api.github.com/user/emails', {
        headers: { Authorization: `Bearer ${tokenData.access_token}`, 'User-Agent': 'ApplyFlow-AI' },
      }),
    ])
    const ghUser = await userRes.json()
    const emails = await emailRes.json()
    const email = ghUser.email || emails.find(e => e.primary)?.email || emails[0]?.email

    res.json({ success: true, user: { name: ghUser.name || ghUser.login, email, picture: ghUser.avatar_url } })
  } catch (err) {
    console.error('GitHub OAuth error:', err.message)
    res.status(500).json({ error: 'GitHub authentication failed' })
  }
})

// ── HEALTH CHECK ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    stripe: !!stripe,
    supabase: !!supabase,
    resend: !!process.env.RESEND_API_KEY,
  })
})

// ── CONTACT FORM ─────────────────────────────────────────────────────────────
app.post('/api/contact', async (req, res) => {
  const { firstname, lastname, email, subject, message } = req.body
  if (!firstname || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return res.status(500).json({ error: 'Email not configured' })
  }

  try {
    const nodemailer = require('nodemailer')
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })

    await transporter.sendMail({
      from: `"Blitzbewerbung Contact" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      replyTo: email,
      subject: `[Contact] ${subject || 'New message'} — ${firstname} ${lastname}`,
      html: `
        <div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#f9fafb;padding:32px 16px">
          <div style="background:white;border-radius:14px;overflow:hidden;box-shadow:0 2px 16px rgba(0,0,0,0.08)">
            <div style="background:linear-gradient(135deg,#7b9fff,#3a5ce0);padding:22px 28px">
              <p style="margin:0 0 4px;font-size:11px;color:rgba(255,255,255,0.65);text-transform:uppercase;letter-spacing:.06em">Blitzbewerbung Contact Form</p>
              <h1 style="margin:0;font-size:18px;font-weight:700;color:white">${subject || 'New message'}</h1>
            </div>
            <div style="padding:22px 28px;border-bottom:1px solid #f0f0f0">
              <table style="border-collapse:collapse;width:100%">
                <tr><td style="padding:5px 16px 5px 0;font-size:12px;color:#6b7280;white-space:nowrap">Name</td><td style="font-size:13px;color:#111">${firstname} ${lastname}</td></tr>
                <tr><td style="padding:5px 16px 5px 0;font-size:12px;color:#6b7280;white-space:nowrap">Email</td><td style="font-size:13px"><a href="mailto:${email}" style="color:#5b7fff">${email}</a></td></tr>
                <tr><td style="padding:5px 16px 5px 0;font-size:12px;color:#6b7280;white-space:nowrap">Topic</td><td style="font-size:13px;color:#111">${subject || '—'}</td></tr>
              </table>
            </div>
            <div style="padding:22px 28px">
              <p style="margin:0 0 10px;font-size:11px;font-weight:600;letter-spacing:.07em;color:#9ca3af;text-transform:uppercase">Message</p>
              <p style="font-size:14px;line-height:1.8;color:#374151;white-space:pre-line">${message}</p>
            </div>
            <div style="padding:14px 28px;background:#f9fafb;border-top:1px solid #f0f0f0;font-size:11px;color:#9ca3af">
              Reply directly to <a href="mailto:${email}" style="color:#5b7fff">${email}</a>
            </div>
          </div>
        </div>`,
    })

    res.json({ success: true })
  } catch (err) {
    console.error('Contact email error:', err)
    res.status(500).json({ error: 'Failed to send email' })
  }
})

// ── SPA FALLBACK: send index.html for unknown routes ─────────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../website/index.html'))
})

// ── START (local dev only — Vercel uses module.exports instead) ───────────────
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n  ApplyFlow AI backend → http://localhost:${PORT}`)
    console.log(`  Stripe:   ${stripe   ? '✓ configured' : '✗ add STRIPE_SECRET_KEY'}`)
    console.log(`  Supabase: ${supabase ? '✓ configured' : '✗ add SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY'}`)
    console.log(`  Resend:   ${process.env.RESEND_API_KEY ? '✓ configured' : '✗ add RESEND_API_KEY (optional)'}`)
    console.log()
  })
}

module.exports = app

// ── HTML ERROR PAGE HELPER ────────────────────────────────────────────────────
function errorPage(title, message) {
  return `<!DOCTYPE html><html><head><title>${title} — ApplyFlow AI</title>
  <style>body{font-family:Inter,sans-serif;background:#000;color:#f0f0f0;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}
  .box{text-align:center;padding:40px;max-width:400px}h1{font-size:22px;margin-bottom:8px}p{color:#787878;font-size:14px;margin-bottom:24px}
  a{color:#f0f0f0;font-weight:600;text-decoration:underline}</style></head>
  <body><div class="box"><h1>${title}</h1><p>${message}</p><a href="/">← Back to home</a></div></body></html>`
}
