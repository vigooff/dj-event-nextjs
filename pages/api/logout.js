import cookie from 'cookie'

export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Destroy cookie
    res.setHeader(
      'Set-Cookie',
      cookie.serialize('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: new Date(0),
        sameSite: 'strict',
        path: '/',
      })
    )

    return res.status(200).json({ message: 'Logged out successfully' })
  } else {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ 
      message: `Method ${req.method} not allowed` 
    })
  }
}