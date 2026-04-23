import { useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const [step,    setStep]    = useState(1)
  const [email,   setEmail]   = useState('')
  const [otp,     setOtp]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleSendOtp = async () => {
    if (!email) return toast.error('Enter your email')
    setLoading(true)
    try {
      await api.post('/auth/send-reset-otp', { email })
      toast.success('Reset OTP sent!')
      setStep(2)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async () => {
    if (!otp) return toast.error('Enter the OTP')
    setLoading(true)
    try {
      await api.post('/auth/verify-otp', { email, otp })
      // Save to localStorage so ResetPassword page can use them
      localStorage.setItem('zuno-reset-email', email)
      localStorage.setItem('zuno-reset-otp', otp)
      toast.success('OTP verified! Set your new password.')
      window.location.href = '/reset-password'
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ width: '100%', maxWidth: '380px', padding: '0 1.5rem' }}>

      <h1 style={{
        fontSize: '1.5rem',
        letterSpacing: '0.4em',
        fontWeight: 600,
        marginBottom: '0.75rem',
        textAlign: 'center',
      }}>
        Z U N O
      </h1>

      <p style={{
        fontSize: '0.72rem',
        color: 'var(--text-muted)',
        textAlign: 'center',
        letterSpacing: '0.05em',
        marginBottom: '2.5rem',
      }}>
        FORGOT PASSWORD
      </p>

      {/* ── Step 1: Email ── */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={labelStyle}>EMAIL</label>
            <input
              type='email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder='your@email.com'
              style={inputStyle}
              autoFocus
              onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
            />
          </div>
          <button onClick={handleSendOtp} disabled={loading} style={btnStyle(loading)}>
            {loading ? 'SENDING...' : 'SEND RESET OTP'}
          </button>
          <div style={{ textAlign: 'center' }}>
            <Link to='/login' style={{
              fontSize: '0.72rem',
              color: 'var(--text-dim)',
              letterSpacing: '0.05em',
            }}>
              Back to <span style={{ color: 'var(--text-muted)' }}>Sign in</span>
            </Link>
          </div>
        </div>
      )}

      {/* ── Step 2: OTP ── */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <p style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            textAlign: 'center',
            lineHeight: 1.6,
          }}>
            Reset code sent to<br />
            <span style={{ color: 'var(--text)' }}>{email}</span>
          </p>

          <div>
            <label style={labelStyle}>OTP CODE</label>
            <input
              type='text'
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder='______'
              maxLength={6}
              autoFocus
              style={{
                ...inputStyle,
                letterSpacing: '0.5em',
                fontSize: '1.25rem',
                textAlign: 'center',
              }}
              onKeyDown={e => e.key === 'Enter' && handleVerifyOtp()}
            />
          </div>

          <button onClick={handleVerifyOtp} disabled={loading} style={btnStyle(loading)}>
            {loading ? 'VERIFYING...' : 'VERIFY OTP'}
          </button>

          <button
            onClick={handleSendOtp}
            style={{
              fontSize: '0.7rem',
              color: 'var(--text-dim)',
              letterSpacing: '0.05em',
              textAlign: 'center',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Didn't receive it?{' '}
            <span style={{ color: 'var(--text-muted)' }}>Resend OTP</span>
          </button>
        </div>
      )}

    </div>
  )
}

const labelStyle = {
  display: 'block',
  fontSize: '0.65rem',
  letterSpacing: '0.15em',
  color: 'var(--text-muted)',
  marginBottom: '6px',
}

const inputStyle = {
  width: '100%',
  padding: '0.65rem 0',
  background: 'none',
  border: 'none',
  borderBottom: '1px solid var(--border)',
  outline: 'none',
  color: 'var(--text)',
  fontSize: '0.85rem',
  fontFamily: 'var(--font)',
}

const btnStyle = (loading) => ({
  marginTop: '0.5rem',
  padding: '0.75rem',
  background: loading ? 'var(--surface-2)' : 'var(--text)',
  color: loading ? 'var(--text-muted)' : 'var(--bg)',
  borderRadius: 'var(--radius)',
  fontFamily: 'var(--font)',
  fontSize: '0.75rem',
  fontWeight: 600,
  letterSpacing: '0.15em',
  cursor: loading ? 'not-allowed' : 'pointer',
  transition: 'all 0.15s',
  border: 'none',
  width: '100%',
})