'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PreviewPage() {
  const router = useRouter()

  useEffect(() => {
    localStorage.setItem('ls_preview_mode', '1')
    localStorage.setItem('ls_demo_session', JSON.stringify({
      id: 'demo-user-123',
      email: 'demo@blitzbewerbung.ch',
      created_at: new Date().toISOString(),
    }))
    router.replace('/dashboard')
  }, [router])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#000' }}>
      <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #1e1e1e', borderTopColor: '#06b6d4', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
