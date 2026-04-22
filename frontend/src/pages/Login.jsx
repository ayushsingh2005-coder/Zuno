import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()

  const [form, setForm]       = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      toast.error('Please fill all fields')
      return
    }

    setLoading(true)
    try {
      const res = await api.post('/auth/login', form)
      // res.data.data = { user, token } from your backend
      const { user, token } = res.data.data
      login(user, token)
      toast.success(`Welcome back, ${user.name}!`)
      navigate('/')
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      width: '100%',
      maxWidth: '380px',
      padding: '0 1.5rem',
    }}>

      {/* Logo */}
      <h1 style={{
        fontSize: '1.5rem',
        letterSpacing: '0.4em',
        fontWeight: 600,
        marginBottom: '2.5rem',
        textAlign: 'center',
      }}>
        Z U N O
      </h1>

      {/* Form */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* Email */}
        <div>
          <label style={labelStyle}>EMAIL</label>
          <input
            name='email'
            type='email'
            value={form.email}
            onChange={handleChange}
            placeholder='your@email.com'
            style={inputStyle}
            autoComplete='email'
          />
        </div>

        {/* Password */}
        <div>
          <label style={labelStyle}>PASSWORD</label>
          <input
            name='password'
            type='password'
            value={form.password}
            onChange={handleChange}
            placeholder='••••••••'
            style={inputStyle}
            autoComplete='current-password'
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
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
          }}
        >
          {loading ? 'SIGNING IN...' : 'SIGN IN'}
        </button>

      </div>

      {/* Links */}
      <div style={{
        marginTop: '2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        alignItems: 'center',
      }}>
        <Link
          to='/register'
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            letterSpacing: '0.05em',
          }}
        >
          Don't have an account? <span style={{ color: 'var(--text)' }}>Register</span>
        </Link>

        <Link
          to='/forgot-password'
          style={{
            fontSize: '0.7rem',
            color: 'var(--text-dim)',
            letterSpacing: '0.05em',
          }}
        >
          Forgot password?
        </Link>
      </div>

    </div>
  )
}

// ── Shared styles ────────────────────────────────────
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
  transition: 'border-color 0.15s',
}