import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function Register() {
  const { login } = useAuth()
  const navigate  = useNavigate()

  const [step,    setStep]    = useState(1)
  const [loading, setLoading] = useState(false)

  // Step 1
  const [email, setEmail] = useState('')

  // Step 2
  const [otp, setOtp] = useState('')

  // Step 3
  const [form, setForm] = useState({
    firstname: '',
    lastname: '',
    password: '',
    confirmPassword: '',
  })

  const handleFormChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  // ── Step 1: Send OTP ───────────────────────────────────────────────────────
  const handleSendOtp = async () => {
    if (!email) return toast.error('Enter your email')
    setLoading(true)
    try {
      await api.post('/auth/send-otp', { email })
      toast.success('OTP sent to your email!')
      setStep(2)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  // ── Step 2: Verify OTP ─────────────────────────────────────────────────────
  const handleVerifyOtp = async () => {
    if (!otp) return toast.error('Enter the OTP')
    setLoading(true)
    try {
      await api.post('/auth/verify-otp', { email, otp })
      toast.success('OTP verified!')
      setStep(3)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP')
    } finally {
      setLoading(false)
    }
  }

  // ── Step 3: Register ───────────────────────────────────────────────────────
  const handleRegister = async () => {
    if (!form.firstname || !form.password || !form.confirmPassword) {
      return toast.error('Fill all fields')
    }
    if (form.password !== form.confirmPassword) {
      return toast.error('Passwords do not match')
    }
    if (form.password.length < 6) {
      return toast.error('Password must be at least 6 characters')
    }
    setLoading(true)
    try {
      const res = await api.post('/auth/register', {
        firstname: form.firstname.trim(),
        lastname:  form.lastname.trim(),
        email,
        password:  form.password,
      })
      const { user, token } = res.data.data
      login(user, token)
      toast.success(`Welcome to Zuno, ${user.fullname?.firstname}!`)
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const steps = ['EMAIL', 'VERIFY', 'DETAILS']

  return (
    <div style={{ width: '100%', maxWidth: '380px', padding: '0 1.5rem' }}>

      {/* Logo */}
      <h1 style={{
        fontSize: '1.5rem',
        letterSpacing: '0.4em',
        fontWeight: 600,
        marginBottom: '2rem',
        textAlign: 'center',
      }}>
        Z U N O
      </h1>

      {/* Step indicators */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '0.5rem',
        marginBottom: '2.5rem',
      }}>
        {steps.map((s, i) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: step > i + 1
                  ? 'var(--text)'
                  : step === i + 1
                    ? 'var(--text)'
                    : 'transparent',
                border: '1px solid',
                borderColor: step >= i + 1 ? 'var(--text)' : 'var(--border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.6rem',
                color: step >= i + 1 ? 'var(--bg)' : 'var(--text-dim)',
                fontWeight: 600,
                flexShrink: 0,
              }}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span style={{
                fontSize: '0.6rem',
                letterSpacing: '0.1em',
                color: step === i + 1 ? 'var(--text)' : 'var(--text-dim)',
              }}>
                {s}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div style={{
                width: '20px',
                height: '1px',
                background: step > i + 1 ? 'var(--text)' : 'var(--border)',
                marginLeft: '4px',
              }} />
            )}
          </div>
        ))}
      </div>

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
            {loading ? 'SENDING...' : 'SEND OTP'}
          </button>
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
            We sent a 6-digit code to<br />
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
              style={{
                ...inputStyle,
                letterSpacing: '0.5em',
                fontSize: '1.25rem',
                textAlign: 'center',
              }}
              autoFocus
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

      {/* ── Step 3: Details ── */}
      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>FIRST NAME</label>
              <input
                name='firstname'
                type='text'
                value={form.firstname}
                onChange={handleFormChange}
                placeholder='First'
                style={inputStyle}
                autoFocus
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>LAST NAME</label>
              <input
                name='lastname'
                type='text'
                value={form.lastname}
                onChange={handleFormChange}
                placeholder='Last'
                style={inputStyle}
              />
            </div>
          </div>
          <div>
            <label style={labelStyle}>PASSWORD</label>
            <input
              name='password'
              type='password'
              value={form.password}
              onChange={handleFormChange}
              placeholder='••••••••'
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>CONFIRM PASSWORD</label>
            <input
              name='confirmPassword'
              type='password'
              value={form.confirmPassword}
              onChange={handleFormChange}
              placeholder='••••••••'
              style={inputStyle}
              onKeyDown={e => e.key === 'Enter' && handleRegister()}
            />
          </div>
          <button onClick={handleRegister} disabled={loading} style={btnStyle(loading)}>
            {loading ? 'CREATING...' : 'CREATE ACCOUNT'}
          </button>
        </div>
      )}

      <div style={{ marginTop: '2rem', textAlign: 'center' }}>
        <Link to='/login' style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <span style={{ color: 'var(--text)' }}>Sign in</span>
        </Link>
      </div>

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