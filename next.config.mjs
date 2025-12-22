/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Tambahkan ini untuk fix masalah localhost di Next.js baru
    unoptimized: true, 
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**',
      },
    ],
  },
}

export default nextConfig;