import { API_URL } from '@/config/index'
import cookie from 'cookie'

export const getImageUrl = (image) => {
  if (!image) return '/images/event-default.png'
  
  const imageUrl = image.formats?.thumbnail?.url || image.url
  
  if (imageUrl?.startsWith('http')) {
    return imageUrl
  }
  
  return imageUrl ? `${API_URL}${imageUrl}` : '/images/event-default.png'
}

export function parseCookies(req) {
  return cookie.parse(req ? req.headers.cookie || '' : '')
}