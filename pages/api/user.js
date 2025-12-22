// pages/api/user.js

import cookie from 'cookie'
import { API_URL } from '@/config/index'

export default async function handler(req, res) {
  // Pastikan header content-type disetel dengan benar
  res.setHeader('Content-Type', 'application/json'); 

  if (req.method === 'GET') {
    
    if (!req.headers.cookie) {
      return res.status(200).json({ user: null })
    }

    const { token } = cookie.parse(req.headers.cookie)

    if (!token) {
      return res.status(200).json({ user: null })
    }

    try {
      const strapiRes = await fetch(`${API_URL}/api/users/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const user = await strapiRes.json()

      if (strapiRes.ok) {
        return res.status(200).json({ user })
      } else {
        // Token invalid/expired: log error di server, return null di client
        console.error('Strapi response not OK, status:', strapiRes.status);
        return res.status(200).json({ user: null })
      }
    } catch (error) {
      console.error('User API fetch error:', error)
      return res.status(200).json({ user: null })
    }
  } else {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ 
      message: `Method ${req.method} not allowed` 
    })
  }
}