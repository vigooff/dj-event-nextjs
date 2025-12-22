import dynamic from 'next/dynamic'
import Link from 'next/link'
import Image from 'next/image'
import Layout from '@/components/Layout'
import { API_URL } from '@/config/index'
import styles from '@/styles/Event.module.css'

// Import EventMap secara dinamis (tanpa SSR)
const EventMap = dynamic(() => import('@/components/EventMap'), {
  ssr: false,
  loading: () => <p>Loading Map...</p>
})

export default function EventPage({ evt }) {
  if (!evt) {
    return (
      <Layout>
        <h1>Event Not Found</h1>
        <Link href='/events'>Go Back</Link>
      </Layout>
    )
  }

  const imageUrl = evt.image ? evt.image.url : null
  const fullImageUrl = imageUrl ? `${API_URL}${imageUrl}` : null

  return (
    <Layout>
      <div className={styles.event}>
        <span>
          {new Date(evt.date).toLocaleDateString('en-US')} at {evt.time}
        </span>
        <h1>{evt.name}</h1>
        
        {fullImageUrl && (
          <div className={styles.image}>
            <Image
              src={fullImageUrl} 
              width={960}
              height={600}
              alt={evt.name}
              loading="eager"
            />
          </div>
        )}

        <h3>Performers:</h3>
        <p>{evt.performers}</p> 

        <h3>Description:</h3>
        <p>{evt.description}</p>

        <h3>Venue: {evt.venue}</h3>
        <p>{evt.address}</p>
        
        {/* Tampilkan Peta */}
        <EventMap evt={evt} />

        <Link href='/events' className={styles.back}>
          {'<'} Go Back
        </Link>
      </div>
    </Layout>
  )
}

export async function getServerSideProps({ query: { slug } }) {
  try {
    const res = await fetch(
      `${API_URL}/api/events?filters[slug][$eq]=${slug}&populate=*`
    )
    if (!res.ok) return { props: { evt: null } }
    
    const jsonResponse = await res.json()
    if (!jsonResponse.data || jsonResponse.data.length === 0) {
      return { props: { evt: null } }
    }

    const evt = jsonResponse.data[0] 
    
    return { props: { evt } }
  } catch (error) {
    console.error('Fetch error:', error)
    return { props: { evt: null } }
  }
}