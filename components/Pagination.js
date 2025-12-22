import Link from 'next/link'
import { PER_PAGE } from '@/config/index'

export default function Pagination({ page, total }) {
  const lastPage = Math.ceil(total / PER_PAGE)
  
  return (
    <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
      {page > 1 && (
        <Link href={`/events?page=${page - 1}`} className='btn-secondary'>
          Prev
        </Link>
      )}

      {page < lastPage && (
        <Link href={`/events?page=${page + 1}`} className='btn-secondary'>
          Next
        </Link>
      )}
    </div>
  )
}