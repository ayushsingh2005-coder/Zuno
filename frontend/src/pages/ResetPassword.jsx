import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function ResetPassword() {
  const navigate = useNavigate()

  const [email,       setEmail]       = useState('')
  const [otp,         setOtp]         = useState('')
  const [password,    setPassword]    = useState('')
  const [confirm,     setConfirm]     = useState('')
  const [loading,     setLoading]     = useState(false)
  const [showPw,      setShowPw]      = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // Read email + otp saved by ForgotPassword page
  useEffect(() => {
    const savedEmail = localStorage.getItem('zuno-reset-email')
    const savedOtp   = localStorage.getItem('zuno-reset-otp')
    if (!savedEmail || !savedOtp) {
      toast.error('Session expired. Please try again.')
      navigate('/forgot-password')
      return
    }
    setEmail(savedEmail)
    setOtp(savedOtp)
  }, [])

  const handleReset = async () => {
    if (!password || !confirm)    return toast.error('Fill all fields')
    if (password.length < 6)      return toast.error('Password must be at least 6 characters')
    if (password !== confirm)     return toast.error('Passwords do not match')

    setLoading(true)
    try {
      await api.post('/auth/reset-password', {
        email,
        otp,
        newPassword: password,
      })
      // Clean up localStorage
      localStorage.removeItem('zuno-reset-email')
      localStorage.removeItem('zuno-reset-otp')
      toast.success('Password reset! Please sign in.')
      navigate('/login')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed')
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
        SET NEW PASSWORD
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* New Password */}
        <div>
          <label style={labelStyle}>NEW PASSWORD</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder='••••••••'
              style={{ ...inputStyle, paddingRight: '2rem' }}
              autoFocus
            />
            <button
              onClick={() => setShowPw(p => !p)}
              style={eyeBtnStyle}
            >
              {showPw ? '🙈' : '👁'}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label style={labelStyle}>CONFIRM PASSWORD</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showConfirm ? 'text' : 'password'}
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder='••••••••'
              style={{ ...inputStyle, paddingRight: '2rem' }}
              onKeyDown={e => e.key === 'Enter' && handleReset()}
            />
            <button
              onClick={() => setShowConfirm(p => !p)}
              style={eyeBtnStyle}
            >
              {showConfirm ? '🙈' : '👁'}
            </button>
          </div>
        </div>

        <button onClick={handleReset} disabled={loading} style={btnStyle(loading)}>
          {loading ? 'RESETTING...' : 'RESET PASSWORD'}
        </button>

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

const eyeBtnStyle = {
  position: 'absolute',
  right: 0,
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  fontSize: '0.75rem',
  color: 'var(--text-dim)',
  padding: '0',
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