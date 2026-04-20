import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import API from '../utils/api.js'
import './Auth.css'

const Register = () => {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState('')

  const validate = () => {
    const e = {}
    if (!form.username || form.username.length < 3)
      e.username = 'Username must be at least 3 characters'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Enter a valid email'
    if (!form.password || form.password.length < 6)
      e.password = 'Password must be at least 6 characters'
    return e
  }

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrors({ ...errors, [e.target.name]: '' })
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setApiError('')
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0)
      return setErrors(validationErrors)

    setLoading(true)
    try {
      await API.post('/auth/register', form)
      navigate('/login')
    } catch (err) {
      setApiError(
        err.response?.data?.message || 'Registration failed. Try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='auth-page'>
      <div className='auth-card'>
        <div className='auth-logo'>▶ YouTube</div>
        <h2 className='auth-title'>Create Account</h2>
        <p className='auth-sub'>to continue to YouTube Clone</p>

        {apiError && <div className='auth-error'>{apiError}</div>}

        <form onSubmit={handleSubmit} className='auth-form'>
          <div className='form-group'>
            <label>Username</label>
            <input
              type='text'
              name='username'
              value={form.username}
              onChange={handleChange}
              placeholder='Choose a username'
            />
            {errors.username && (
              <span className='field-error'>{errors.username}</span>
            )}
          </div>
          <div className='form-group'>
            <label>Email</label>
            <input
              type='email'
              name='email'
              value={form.email}
              onChange={handleChange}
              placeholder='Enter your email'
            />
            {errors.email && (
              <span className='field-error'>{errors.email}</span>
            )}
          </div>
          <div className='form-group'>
            <label>Password</label>
            <input
              type='password'
              name='password'
              value={form.password}
              onChange={handleChange}
              placeholder='Min 6 characters'
            />
            {errors.password && (
              <span className='field-error'>{errors.password}</span>
            )}
          </div>
          <button type='submit' className='auth-submit' disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className='auth-switch'>
          Already have an account? <Link to='/login'>Sign in</Link>
        </p>
      </div>
    </div>
  )
}

export default Register
