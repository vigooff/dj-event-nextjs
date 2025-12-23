import Link from 'next/link'
import Layout from '@/components/Layout'
import EventItem from '@/components/EventItem'
import { API_URL } from '@/config/index'
import styles from '@/styles/Index.module.css'

export default function HomePage({ events }) {
  return (
    <Layout>
      <h1>Upcoming Events</h1>
      {events.length === 0 && <h3>No events to show</h3>}

      <div className={styles.events}>
        {events.map((evt) => (
          <EventItem key={evt.id} evt={evt} />
        ))}
      </div>

      {events.length > 0 && (
        <div className={styles.viewAll}>
          <Link href='/events' className='btn-secondary'>
            View All Events
          </Link>
        </div>
      )}
    </Layout>
  )
}

export async function getServerSideProps() {
  try {
    const res = await fetch(
      `${API_URL}/api/events?sort[0]=date:asc&pagination[limit]=3&populate=*`
    )

    if (!res.ok) {
      return { props: { events: [] } }
    }

    const jsonResponse = await res.json()

    return {
      props: {
        events: jsonResponse.data || [],
      },
    }
  } catch (error) {
    console.error(error)
    return { props: { events: [] } }
  }
}