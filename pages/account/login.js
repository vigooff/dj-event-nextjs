import { FaUser } from 'react-icons/fa'
import { useState, useContext } from 'react'
import Link from 'next/link'
import Layout from '@/components/Layout'
import AuthContext from '@/context/AuthContext'
import styles from '@/styles/AuthForm.module.css' // Import styles untuk form

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login } = useContext(AuthContext)

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Tambahkan validasi dasar untuk menghindari pemanggilan API kosong
    if (email === '' || password === '') {
        toast.error('Please enter both email and password.')
        return
    }
    
    login({ email, password })
  }

  return (
    <Layout title="User Login">
      <div className={styles.auth}>
        <h1>
          <FaUser /> Log In
        </h1>

        <form onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email">Email</label>
            <input 
              id="email"
              type="email" // ⬅️ Perbaikan: Pastikan type adalah email
              value={email} 
              className={styles.input} // ⬅️ Tambahkan className untuk styling
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              className={styles.input} // ⬅️ Tambahkan className untuk styling yang konsisten
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <input type="submit" value="Login" className="btn" />
        </form>

        <p>
          No account? <Link href="/account/register">Register</Link>
        </p>
      </div>
    </Layout>
  )
}