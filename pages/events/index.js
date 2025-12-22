import Layout from '@/components/Layout'
import EventItem from '@/components/EventItem'
import Pagination from '@/components/Pagination'
import { API_URL, PER_PAGE } from '@/config/index'

export default function EventsPage({ events, page, total }) {
  return (
    <Layout>
      <h1>Events</h1>
      {events.length === 0 && <h3>No events to show</h3>}

      {events.map((evt) => (
        <EventItem key={evt.id} evt={evt} />
      ))}

      <Pagination page={page} total={total} />
    </Layout>
  )
}

export async function getServerSideProps({ query: { page = 1 } }) {
  try {
    const start = +page === 1 ? 0 : (+page - 1) * PER_PAGE

    const eventRes = await fetch(
      `${API_URL}/api/events?sort[0]=date:asc&pagination[limit]=${PER_PAGE}&pagination[start]=${start}&populate=image`
    )

    if (!eventRes.ok) {
      return { props: { events: [], page: +page, total: 0 } }
    }

    const jsonResponse = await eventRes.json()
    const events = jsonResponse.data // Data sudah flat
    const total = jsonResponse.meta.pagination.total

    return { props: { events, page: +page, total } }
  } catch (error) {
    console.error('Fetch error:', error)
    return { props: { events: [], page: +page, total: 0 } }
  }
}