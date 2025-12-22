import Link from 'next/link'
import Image from 'next/image'
import styles from '@/styles/EventItem.module.css'

export default function EventItem({ evt }) {
  // Get image URL - image adalah object langsung
  const getImageUrl = () => {
    try {
      if (evt.image?.formats?.thumbnail?.url) {
        return `http://localhost:1337${evt.image.formats.thumbnail.url}`
      }
      if (evt.image?.url) {
        return `http://localhost:1337${evt.image.url}`
      }
      return '/images/event-default.png'
    } catch (error) {
      console.error('Image error:', error)
      return '/images/event-default.png'
    }
  }

  return (
    <div className={styles.event}>
      <div className={styles.img}>
        <Image
          src={getImageUrl()}
          width={170}
          height={100}
          alt={evt.name || 'Event image'}
          loading="eager"
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