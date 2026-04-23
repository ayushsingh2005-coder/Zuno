import { useEffect, useRef, useState } from 'react'
import { Camera, Lock, Eye, EyeOff, Check, X } from 'lucide-react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, updateUser } = useAuth()
  const fileInputRef = useRef(null)

  // ── Profile state ──────────────────────────────────────────────────────────
  const [profile,        setProfile]       = useState(null)
  const [loadingProfile, setLoadingProfile] = useState(true)

  // ── Name edit — two fields because backend has fullname.firstname/lastname ──
  const [editingName, setEditingName] = useState(false)
  const [firstName,   setFirstName]   = useState('')
  const [lastName,    setLastName]    = useState('')
  const [savingName,  setSavingName]  = useState(false)

  // ── Avatar ─────────────────────────────────────────────────────────────────
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [avatarPreview,   setAvatarPreview]   = useState(null)

  // ── Password ───────────────────────────────────────────────────────────────
  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [savingPw, setSavingPw] = useState(false)
  const [showPw,   setShowPw]   = useState({
    current: false, new: false, confirm: false,
  })

  // ── Fetch profile on mount ─────────────────────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res  = await api.get('/user/profile')
        // your getProfile returns { user: req.user } inside data.data
        const data = res.data.data?.user || res.data.data
        setProfile(data)
        setFirstName(data?.fullname?.firstname || '')
        setLastName(data?.fullname?.lastname   || '')
      } catch {
        if (user) {
          setProfile(user)
          setFirstName(user?.fullname?.firstname || '')
          setLastName(user?.fullname?.lastname   || '')
        }
        toast.error('Could not load profile')
      } finally {
        setLoadingProfile(false)
      }
    }
    fetchProfile()
  }, [])

  // ── Save name ──────────────────────────────────────────────────────────────
  const handleSaveName = async () => {
    const fn = firstName.trim()
    const ln = lastName.trim()

    if (!fn) return toast.error('First name is required')

    // No change → just close
    if (
      fn === profile?.fullname?.firstname &&
      ln === (profile?.fullname?.lastname || '')
    ) {
      setEditingName(false)
      return
    }

    setSavingName(true)
    try {
      // Backend expects { firstname, lastname }
      const res     = await api.put('/user/profile', { firstname: fn, lastname: ln })
      const updated = res.data.data?.user || res.data.data

      setProfile(prev => ({
        ...prev,
        fullname: {
          firstname: updated?.fullname?.firstname || fn,
          lastname:  updated?.fullname?.lastname  || ln,
        },
      }))

      // Keep AuthContext (Navbar) in sync
      updateUser({
        fullname: {
          firstname: updated?.fullname?.firstname || fn,
          lastname:  updated?.fullname?.lastname  || ln,
        },
      })

      setEditingName(false)
      toast.success('Name updated')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update name')
    } finally {
      setSavingName(false)
    }
  }

  const handleCancelName = () => {
    setFirstName(profile?.fullname?.firstname || '')
    setLastName(profile?.fullname?.lastname   || '')
    setEditingName(false)
  }

  // ── Avatar upload ──────────────────────────────────────────────────────────
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) return toast.error('Select an image file')
    if (file.size > 5 * 1024 * 1024)     return toast.error('Image must be under 5 MB')

    setAvatarPreview(URL.createObjectURL(file))
    setUploadingAvatar(true)

    try {
      const formData = new FormData()
      formData.append('profilePicture', file)

      const res = await api.put('/user/profile/picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      // backend returns { profilePicture: { url, public_id } }
      const newUrl =
        res.data.data?.profilePicture?.url ||
        res.data.data?.profilePicture ||
        avatarPreview

      setProfile(prev => ({
        ...prev,
        profilePicture: { ...prev?.profilePicture, url: newUrl },
      }))
      updateUser({ profilePicture: { url: newUrl } })
      setAvatarPreview(null)
      toast.success('Profile picture updated')
    } catch (err) {
      setAvatarPreview(null)
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploadingAvatar(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  // ── Change password ────────────────────────────────────────────────────────
  const handlePwChange = (e) =>
    setPwForm(prev => ({ ...prev, [e.target.name]: e.target.value }))

  const handleSavePw = async () => {
    const { currentPassword, newPassword, confirmPassword } = pwForm

    if (!currentPassword || !newPassword || !confirmPassword)
      return toast.error('Fill all password fields')
    if (newPassword.length < 6)
      return toast.error('New password must be at least 6 characters')
    if (newPassword !== confirmPassword)
      return toast.error('Passwords do not match')

    setSavingPw(true)
    try {
      await api.put('/user/change-password', { currentPassword, newPassword })
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
      toast.success('Password changed')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password')
    } finally {
      setSavingPw(false)
    }
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  const avatarUrl =
    avatarPreview ||
    profile?.profilePicture?.url ||
    null

  const displayName =
    [profile?.fullname?.firstname, profile?.fullname?.lastname]
      .filter(Boolean)
      .join(' ') || 'User'

  const initials =
    [profile?.fullname?.firstname?.[0], profile?.fullname?.lastname?.[0]]
      .filter(Boolean)
      .join('')
      .toUpperCase() || 'U'

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loadingProfile) {
    return (
      <div style={{
        padding: '3rem 2rem',
        color: 'var(--text-muted)',
        fontSize: '0.8rem',
        letterSpacing: '0.1em',
      }}>
        LOADING...
      </div>
    )
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: '2.5rem 2rem', maxWidth: '560px' }}>

      {/* Page title */}
      <h2 style={{
        fontSize: '2rem',
        fontWeight: 400,
        letterSpacing: '-0.02em',
        marginBottom: '2.5rem',
      }}>
        Profile
      </h2>

      {/* ════════════════════════════════════════
          SECTION 1 — Avatar
      ════════════════════════════════════════ */}
      <div style={{
        display: 'flex', alignItems: 'center',
        gap: '1.5rem', marginBottom: '2.5rem',
      }}>

        {/* Clickable avatar circle */}
        <div
          onClick={() => !uploadingAvatar && fileInputRef.current?.click()}
          style={{
            width: '80px', height: '80px',
            borderRadius: '50%',
            background: 'var(--surface-2)',
            border: '1px solid var(--border)',
            overflow: 'hidden',
            position: 'relative',
            cursor: uploadingAvatar ? 'not-allowed' : 'pointer',
            flexShrink: 0,
          }}
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={displayName}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.4rem', fontWeight: 600,
              color: 'var(--text-muted)',
            }}>
              {initials}
            </div>
          )}

          {/* Hover overlay */}
          <div
            className='avatar-overlay'
            style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.55)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              opacity: uploadingAvatar ? 1 : 0,
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
            onMouseLeave={e => { if (!uploadingAvatar) e.currentTarget.style.opacity = '0' }}
          >
            {uploadingAvatar
              ? <div style={spinnerStyle} />
              : <Camera size={18} color='#fff' />
            }
          </div>
        </div>

        {/* Name + email beside avatar */}
        <div>
          <p style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '2px' }}>
            {displayName}
          </p>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {profile?.email}
          </p>
          {profile?.role === 'admin' && (
            <span style={{
              display: 'inline-block', marginTop: '6px',
              padding: '2px 8px',
              background: 'var(--surface-2)',
              border: '1px solid var(--border)',
              borderRadius: '99px',
              fontSize: '0.62rem', letterSpacing: '0.12em',
              color: 'var(--text-muted)',
            }}>
              ADMIN
            </span>
          )}
        </div>

        <input
          ref={fileInputRef}
          type='file'
          accept='image/*'
          style={{ display: 'none' }}
          onChange={handleAvatarChange}
        />
      </div>

      <Divider />

      {/* ════════════════════════════════════════
          SECTION 2 — Account Info
      ════════════════════════════════════════ */}
      <div style={{ marginBottom: '2.5rem' }}>

        <SectionLabel label='ACCOUNT INFO' />

        {/* Name row */}
        <Field label='NAME'>
          {editingName ? (
            <div>
              {/* Two inputs: first + last */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                <input
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  placeholder='First name'
                  autoFocus
                  onKeyDown={e => {
                    if (e.key === 'Enter')  handleSaveName()
                    if (e.key === 'Escape') handleCancelName()
                  }}
                  style={{ ...inputStyle, flex: 1 }}
                />
                <input
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  placeholder='Last name'
                  onKeyDown={e => {
                    if (e.key === 'Enter')  handleSaveName()
                    if (e.key === 'Escape') handleCancelName()
                  }}
                  style={{ ...inputStyle, flex: 1 }}
                />
              </div>

              {/* Confirm / Cancel buttons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={handleSaveName}
                  disabled={savingName}
                  style={iconBtnStyle}
                  title='Save'
                >
                  <Check size={13} />
                </button>
                <button
                  onClick={handleCancelName}
                  style={iconBtnStyle}
                  title='Cancel'
                >
                  <X size={13} />
                </button>
              </div>
            </div>
          ) : (
            /* Click to edit */
            <div
              onClick={() => setEditingName(true)}
              style={{
                fontSize: '0.85rem',
                cursor: 'pointer',
                padding: '0.4rem 0',
                borderBottom: '1px solid transparent',
                transition: 'border-color 0.15s',
                display: 'inline-flex', alignItems: 'center', gap: '8px',
              }}
              onMouseEnter={e => e.currentTarget.style.borderBottomColor = 'var(--border)'}
              onMouseLeave={e => e.currentTarget.style.borderBottomColor = 'transparent'}
            >
              {displayName}
              <span style={{
                fontSize: '0.62rem',
                color: 'var(--text-dim)',
                letterSpacing: '0.1em',
              }}>
                EDIT
              </span>
            </div>
          )}
        </Field>

        {/* Email — read only */}
        <Field label='EMAIL'>
          <p style={{
            fontSize: '0.85rem',
            color: 'var(--text-muted)',
            padding: '0.4rem 0',
          }}>
            {profile?.email}
          </p>
        </Field>

      </div>

      <Divider />

      {/* ════════════════════════════════════════
          SECTION 3 — Change Password
      ════════════════════════════════════════ */}
      <div style={{ marginBottom: '2.5rem' }}>

        <SectionLabel label='CHANGE PASSWORD' />

        {[
          { name: 'currentPassword', label: 'CURRENT PASSWORD', key: 'current' },
          { name: 'newPassword',     label: 'NEW PASSWORD',     key: 'new'     },
          { name: 'confirmPassword', label: 'CONFIRM PASSWORD', key: 'confirm' },
        ].map(({ name, label, key }) => (
          <Field key={name} label={label}>
            <div style={{ position: 'relative' }}>
              <input
                name={name}
                type={showPw[key] ? 'text' : 'password'}
                value={pwForm[name]}
                onChange={handlePwChange}
                placeholder='••••••••'
                style={{ ...inputStyle, paddingRight: '2rem' }}
              />
              <button
                onClick={() => setShowPw(prev => ({ ...prev, [key]: !prev[key] }))}
                style={{
                  position: 'absolute', right: 0,
                  top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--text-dim)',
                  display: 'flex', alignItems: 'center',
                }}
              >
                {showPw[key] ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </Field>
        ))}

        <button
          onClick={handleSavePw}
          disabled={savingPw}
          style={{
            marginTop: '1.25rem',
            padding: '0.65rem 1.5rem',
            background: savingPw ? 'var(--surface-2)' : 'var(--text)',
            color: savingPw ? 'var(--text-muted)' : 'var(--bg)',
            borderRadius: 'var(--radius)',
            fontSize: '0.72rem',
            fontWeight: 600,
            letterSpacing: '0.15em',
            cursor: savingPw ? 'not-allowed' : 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {savingPw ? 'SAVING...' : 'UPDATE PASSWORD'}
        </button>

      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ── Local reusable pieces ─────────────────────────────────────────────────────

function Divider() {
  return <div style={{ height: '1px', background: 'var(--border)', marginBottom: '2rem' }} />
}

function SectionLabel({ label }) {
  return (
    <p style={{
      fontSize: '0.65rem',
      letterSpacing: '0.15em',
      color: 'var(--text-muted)',
      marginBottom: '1.25rem',
    }}>
      {label}
    </p>
  )
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <label style={{
        display: 'block',
        fontSize: '0.62rem',
        letterSpacing: '0.15em',
        color: 'var(--text-dim)',
        marginBottom: '4px',
      }}>
        {label}
      </label>
      {children}
    </div>
  )
}

// ── Shared styles ─────────────────────────────────────────────────────────────

const inputStyle = {
  width: '100%',
  padding: '0.4rem 0',
  background: 'none',
  border: 'none',
  borderBottom: '1px solid var(--border)',
  outline: 'none',
  color: 'var(--text)',
  fontSize: '0.85rem',
  fontFamily: 'var(--font)',
  transition: 'border-color 0.15s',
}

const iconBtnStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '26px', height: '26px',
  borderRadius: '50%',
  background: 'var(--surface-2)',
  color: 'var(--text-muted)',
  flexShrink: 0,
}

const spinnerStyle = {
  width: '16px', height: '16px',
  borderRadius: '50%',
  border: '2px solid rgba(255,255,255,0.3)',
  borderTopColor: '#fff',
  animation: 'spin 0.7s linear infinite',
}