import qs from 'qs'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Layout from '@/components/Layout'
import EventItem from '@/components/EventItem'
import { API_URL } from '@/config/index'

export default function SearchPage({ events }) {
  const router = useRouter()

  return (
    <Layout title='Search Results'>
      <Link href='/events'>Go Back</Link>
      <h1>Search Results for {router.query.term}</h1>
      {}
      {Array.isArray(events) && events.length === 0 && <h3>No events to show</h3>}

      {}
      {Array.isArray(events) && events.map((evt) => (
        <EventItem key={evt.id} evt={evt} />
      ))}
      
      {}
      {!Array.isArray(events) && <h3>Error fetching events or no events to show</h3>}
      
    </Layout>
  )
}

export async function getServerSideProps({ query: { term } }) {

  const query = qs.stringify({
    filters: {
      $or: [
        { name: { $contains: term } },
        { performers: { $contains: term } },
        { description: { $contains: term } },
        { venue: { $contains: term } },
      ],
    },
    populate: 'image',
  }, {
    encodeValuesOnly: true,
  })

  try {
    const res = await fetch(`${API_URL}/api/events?${query}`)
    
    if (!res.ok) {
        console.error(`API Error: ${res.status} - ${res.statusText}`)
        
        return { props: { events: [] } } 
    }
    
    const jsonResponse = await res.json()
    
    
    const events = jsonResponse.data || [] 

   
    const flatEvents = events.map(evt => ({
      id: evt.id,
      ...evt, 
    }))

    
    return {
      props: { events: flatEvents },
    }
    
  } catch (error) {
    console.error('Fetch error in search:', error)
    
    return { props: { events: [] } }
  }
}