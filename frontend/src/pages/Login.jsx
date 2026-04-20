import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../utils/api.js'
import './Auth.css'

const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = e =>
    setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) {
      return setError('All fields are required')
    }
    setLoading(true)
    try {
      const res = await API.post('/auth/login', form)
      login(res.data.data)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='auth-page'>
      <div className='auth-card'>
        <div className='auth-logo'>▶ YouTube</div>
        <h2 className='auth-title'>Sign In</h2>
        <p className='auth-sub'>to continue to YouTube Clone</p>

        {error && <div className='auth-error'>{error}</div>}

        <form onSubmit={handleSubmit} className='auth-form'>
          <div className='form-group'>
            <label>Email</label>
            <input
              type='email'
              name='email'
              value={form.email}
              onChange={handleChange}
              placeholder='Enter your email'
              autoComplete='email'
            />
          </div>
          <div className='form-group'>
            <label>Password</label>
            <input
              type='password'
              name='password'
              value={form.password}
              onChange={handleChange}
              placeholder='Enter your password'
              autoComplete='current-password'
            />
          </div>
          <button type='submit' className='auth-submit' disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className='auth-switch'>
          Don't have an account? <Link to='/register'>Create account</Link>
        </p>
      </div>
    </div>
  )
}

export default Login
