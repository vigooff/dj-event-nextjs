import { parseCookies } from '@/helpers/index'
import Layout from '@/components/Layout'
import DashboardEvent from '@/components/DashboardEvent'
import { API_URL } from '@/config/index'
import styles from '@/styles/Dashboard.module.css'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'

export default function DashboardPage({ events, token }) {
  const router = useRouter()

  const deleteEvent = async (id) => {
    if (!confirm('Are you sure?')) return

    const res = await fetch(`${API_URL}/api/events/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!res.ok) {
      toast.error('Failed to delete event')
      return
    }

    router.reload()
  }

  return (
    <Layout title="User Dashboard">
      <div className={styles.dash}>
        <h1>Dashboard</h1>

        {events.length === 0 && <p>No events yet</p>}

        {events.map((evt) => (
          <DashboardEvent
            key={evt.id}
            evt={evt}
            handleDelete={deleteEvent}
          />
        ))}
      </div>
    </Layout>
  )
}

export async function getServerSideProps({ req }) {
  const { token } = parseCookies(req)

  if (!token) {
    return {
      redirect: {
        destination: '/account/login',
        permanent: false,
      },
    }
  }

  const res = await fetch(`${API_URL}/api/events/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    return {
      redirect: {
        destination: '/account/login',
        permanent: false,
      },
    }
  }

  const events = await res.json()

  return {
    props: {
      events,
      token,
    },
  }
}
