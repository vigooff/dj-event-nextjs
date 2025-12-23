import Link from 'next/link'
import Image from 'next/image'
import { API_URL } from '@/config/index'
import styles from '@/styles/EventItem.module.css'

export default function EventItem({ evt }) {
  const getImageUrl = (image) => {
    if (!image) return '/images/event-default.png'
    const url = image.formats?.thumbnail?.url || image.url
    return url ? (url.startsWith('http') ? url : `${API_URL}${url}`) : '/images/event-default.png'
  }

  return (
    <div className={styles.event}>
      <div className={styles.img}>
        <Image
          src={getImageUrl(evt.image)}
          width={170}
          height={100}
          alt={evt.name}
        />
      </div>

      <div className={styles.info}>
        <span>
          {new Date(evt.date).toLocaleDateString('en-US')} at {evt.time}
        </span>
        <h3>{evt.name}</h3>
      </div>

      <div className={styles.link}>
        <Link href={`/events/${evt.slug}`} className='btn'>
          Details
        </Link>
      </div>
    </div>
  )
}