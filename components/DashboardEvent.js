import Link from 'next/link'
import { FaPencilAlt, FaTimes } from 'react-icons/fa'
import styles from '@/styles/DashboardEvent.module.css'

export default function DashboardEvent({ evt, handleDelete }) {
  const eventId = evt.documentId || evt.id

  return (
    <div className={styles.event}>
      <h4>
        <Link href={`/events/${evt.slug}`}>
          {evt.name}
        </Link>
      </h4>
      <Link href={`/events/edit/${eventId}`} className={styles.edit}>
        <FaPencilAlt /> <span>Edit Event</span>
      </Link>
      <button 
        className={styles.delete} 
        onClick={() => handleDelete(eventId)}
      >
        <FaTimes /> <span>Delete</span>
      </button>
    </div>
  )
}