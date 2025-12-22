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

    // Check if user is logged in on mount
    useEffect(() => {
        checkUserLoggedIn()
    }, [])

    // Check if user is logged in
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
                // Token invalid, clear it
                Cookies.remove('token')
                setUser(null)
            }
        } catch (error) {
            console.error('Error checking auth:', error)
            Cookies.remove('token')
            setUser(null)
        }
        
        setLoading(false)
    }

    // Register user
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

            // ✅ PERBAIKAN: Auto login after register
            // Strapi v4 mengembalikan JWT dan user saat register
            if (data.jwt && data.user) {
                Cookies.set('token', data.jwt, { 
                    expires: 7, 
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'Lax',
                    path: '/',
                })
                setUser(data.user)
                toast.success('✅ Registration successful!')
                router.push('/account/dashboard')
            } else {
                toast.success('Registration successful, please login')
                router.push('/account/login')
            }
        } catch (error) {
            console.error('Registration error:', error)
            toast.error('Registration failed. Please try again.')
        }
    }

    // Login user
    const login = async ({ email, password }) => {
        const loginUrl = `${API_URL}/api/auth/local`
        
        console.log('🔐 Attempting login...')
        
        try {
            const res = await fetch(loginUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier: email, password }),
            })
            
            console.log('📡 Response Status:', res.status)
            
            if (!res.ok) {
                const errorText = await res.text()
                
                try {
                    const errorData = JSON.parse(errorText)
                    const errorMessage = errorData.error?.message || errorData.message || 'Invalid credentials'
                    toast.error(`❌ Login Failed: ${errorMessage}`)
                } catch (e) {
                    toast.error(`❌ Server Error (${res.status}): ${errorText}`)
                }
                return
            }

            const data = await res.json()
            
            // ✅ Verify user has authenticated role
            console.log('✅ Login successful')
            console.log('👤 User role:', data.user?.role?.name || 'N/A')
            
            if (data.user?.role?.type === 'public') {
                toast.error('⚠️ Account tidak memiliki role Authenticated. Hubungi admin.')
                return
            }

            // Save token to cookie
            Cookies.set('token', data.jwt, { 
                expires: 7, 
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'Lax',
                path: '/',
            })
            
            setUser(data.user)
            toast.success('🎉 Login successful!')
            router.push('/account/dashboard')

        } catch (err) {
            console.error('🔥 Login error:', err)
            toast.error(`❌ Network error: ${err.message}`)
        }
    }

    // Logout user
    const logout = async () => {
        Cookies.remove('token')
        setUser(null)
        toast.success('👋 Logged out successfully')
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