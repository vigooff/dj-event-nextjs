import { parseCookies } from '@/helpers/index'
import { useRouter } from 'next/router'
import { toast } from 'react-toastify'
import Layout from '@/components/Layout'
import DashboardEvent from '@/components/DashboardEvent'
import { API_URL } from '@/config/index'
import styles from '@/styles/Dashboard.module.css'

export default function DashboardPage({ events, token }) {
  const router = useRouter()

  const deleteEvent = async (id) => {
    if (confirm('Apakah Anda yakin ingin menghapus event ini?')) {
      const res = await fetch(`${API_URL}/api/events/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error?.message || 'Gagal menghapus event')
      } else {
        toast.success('Event berhasil dihapus')
        router.reload()
      }
    }
  }

  return (
    <Layout title="User Dashboard">
      <div className={styles.dash}>
        <h1>Dashboard</h1>
        <h3>My Events</h3>

        {events && events.length === 0 && (
          <p style={{ marginTop: '20px', fontStyle: 'italic' }}>
            Belum ada event yang dibuat.
          </p>
        )}

        {events && events.map((evt) => (
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

  try {
    const res = await fetch(`${API_URL}/api/events/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await res.json()

    // Strapi terkadang membungkus data dalam data.data atau langsung array
    const events = data.data ? data.data : (Array.isArray(data) ? data : [])

    return {
      props: {
        events,
        token,
      },
    }
  } catch (error) {
    return {
      props: { events: [], token },
    }
  }
}