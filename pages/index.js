import Link from 'next/link'
import Layout from '@/components/Layout'
import EventItem from '@/components/EventItem'
import { API_URL } from '@/config/index'

export default function HomePage({ events }) {
  return (
    <Layout>
      <h1>Upcoming Events</h1>
      {events.length === 0 && <h3>No events to show</h3>}

      {events.map((evt) => (
        <EventItem key={evt.id} evt={evt} />
      ))}

      {events.length > 0 && (
        <Link href='/events' className='btn-secondary'>
          View All Events
        </Link>
      )}
    </Layout>
  )
}

export async function getServerSideProps() {
  try {
    const res = await fetch(
      `${API_URL}/api/events?sort[0]=date:asc&pagination[limit]=3&populate=image`
    )

    if (!res.ok) {
      console.error('API Error:', res.status)
      return { props: { events: [] } }
    }

    const jsonResponse = await res.json()

    if (!jsonResponse.data || jsonResponse.data.length === 0) {
      console.log('No events found')
      return { props: { events: [] } }
    }

    
    const events = jsonResponse.data

    console.log('Events to render:', events.length)
    return { props: { events } }
  } catch (error) {
    console.error('Fetch error:', error)
    return { props: { events: [] } }
  }
}