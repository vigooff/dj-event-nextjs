import { parseCookies } from '@/helpers/index'
import { toast } from 'react-toastify'
import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { API_URL } from '@/config/index'
import styles from '@/styles/Form.module.css'

export default function EditEventPage({ evt, token }) {
  const [values, setValues] = useState({
    name: evt.name,
    performers: evt.performers,
    venue: evt.venue,
    address: evt.address,
    date: evt.date,
    time: evt.time,
    description: evt.description,
    lat: evt.lat || '',
    lng: evt.lng || '',
  })

  const [loadingCoords, setLoadingCoords] = useState(false)
  const router = useRouter()

  const getCoordinates = async () => {
    if (!values.address) return toast.error('Alamatnya masih kosong')
    
    setLoadingCoords(true)
    try {
      const res = await fetch(`/api/geocoder?address=${encodeURIComponent(values.address)}`)
      const data = await res.json()
      if (data && data.length > 0) {
        setValues({ ...values, lat: data[0].lat, lng: data[0].lon })
        toast.success('Lokasi berhasil diupdate')
      }
    } catch (err) {
      toast.error('Gagal update lokasi')
    } finally {
      setLoadingCoords(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const dataToSend = {
      ...values,
      lat: parseFloat(values.lat),
      lng: parseFloat(values.lng)
    }

    const res = await fetch(`${API_URL}/api/events/${evt.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ data: dataToSend }),
    })

    if (res.ok) {
      toast.success('Event sudah diperbarui')
      router.push('/account/dashboard')
    } else {
      toast.error('Gagal update data')
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setValues({ ...values, [name]: value })
  }

  return (
    <Layout title='Edit Event'>
      <Link href='/account/dashboard'>Go Back</Link>
      <h1>Edit Event</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.grid}>
          <div>
            <label htmlFor='name'>Name</label>
            <input type='text' name='name' value={values.name} onChange={handleInputChange} />
          </div>
          <div>
            <label htmlFor='address'>Address</label>
            <input type='text' name='address' value={values.address} onChange={handleInputChange} />
            <button type='button' className='btn-secondary' onClick={getCoordinates} disabled={loadingCoords}>
              {loadingCoords ? 'Update...' : 'Cari Lokasi Baru'}
            </button>
          </div>
          <div>
            <label htmlFor='lat'>Latitude</label>
            <input type='text' name='lat' value={values.lat} readOnly />
          </div>
          <div>
            <label htmlFor='lng'>Longitude</label>
            <input type='text' name='lng' value={values.lng} readOnly />
          </div>
          <div>
            <label htmlFor='performers'>Performers</label>
            <input type='text' name='performers' value={values.performers} onChange={handleInputChange} />
          </div>
          <div>
            <label htmlFor='venue'>Venue</label>
            <input type='text' name='venue' value={values.venue} onChange={handleInputChange} />
          </div>
          <div>
            <label htmlFor='date'>Date</label>
            <input type='date' name='date' value={values.date} onChange={handleInputChange} />
          </div>
          <div>
            <label htmlFor='time'>Time</label>
            <input type='text' name='time' value={values.time} onChange={handleInputChange} />
          </div>
        </div>

        <div>
          <label htmlFor='description'>Description</label>
          <textarea name='description' value={values.description} onChange={handleInputChange}></textarea>
        </div>

        <input type='submit' value='Update Event' className='btn' />
      </form>
    </Layout>
  )
}

export async function getServerSideProps({ params: { id }, req }) {
  const { token } = parseCookies(req)
  const res = await fetch(`${API_URL}/api/events/${id}`)
  const json = await res.json()
  const evt = json.data ? { id: json.data.id, ...json.data } : json
  return { props: { evt, token } }
}