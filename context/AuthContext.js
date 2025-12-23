import { createContext, useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'
import Cookies from 'js-cookie'
import { API_URL } from '@/config/index'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        checkUserLoggedIn()
    }, [])

    const checkUserLoggedIn = async () => {
        const token = Cookies.get('token')
        
        if (!token) {
            setLoading(false)
            return
        }

        try {
            const res = await fetch(`${API_URL}/api/users/me`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            if (res.ok) {
                const userData = await res.json()
                setUser(userData)
            } else {
                Cookies.remove('token')
                setUser(null)
            }
        } catch (error) {
            console.error(error)
            Cookies.remove('token')
            setUser(null)
        }
        
        setLoading(false)
    }

    const register = async ({ username, email, password }) => {
        try {
            const res = await fetch(`${API_URL}/api/auth/local/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }),
            })

            const data = await res.json()

            if (!res.ok) {
                const errorMessage = data.error?.message || data.message || 'Registration failed'
                toast.error(errorMessage)
                return
            }

            if (data.jwt && data.user) {
                Cookies.set('token', data.jwt, { 
                    expires: 7, 
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'Lax',
                    path: '/',
                })
                setUser(data.user)
                toast.success('Registration successful')
                router.push('/account/dashboard')
            } else {
                toast.success('Registration successful, please login')
                router.push('/account/login')
            }
        } catch (error) {
            console.error(error)
            toast.error('Registration failed')
        }
    }

    const login = async ({ email, password }) => {
        const loginUrl = `${API_URL}/api/auth/local`
        
        try {
            const res = await fetch(loginUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier: email, password }),
            })
            
            if (!res.ok) {
                const errorText = await res.text()
                try {
                    const errorData = JSON.parse(errorText)
                    toast.error(errorData.error?.message || 'Invalid credentials')
                } catch (e) {
                    toast.error('Server error')
                }
                return
            }

            const data = await res.json()
            
            Cookies.set('token', data.jwt, { 
                expires: 7, 
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Lax',
                path: '/',
            })
            
            setUser(data.user)
            toast.success('Login successful')
            router.push('/account/dashboard')

        } catch (err) {
            console.error(err)
            toast.error('Network error')
        }
    }

    const logout = async () => {
        Cookies.remove('token')
        setUser(null)
        toast.success('Logged out successfully')
        router.push('/')
    }

    return (
        <AuthContext.Provider value={{ 
            user, 
            register, 
            login, 
            logout,
            loading 
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext