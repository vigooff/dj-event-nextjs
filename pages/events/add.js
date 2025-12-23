import { parseCookies } from '@/helpers/index'
import { toast } from 'react-toastify'
import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Layout from '@/components/Layout'
import { API_URL } from '@/config/index'
import styles from '@/styles/Form.module.css'

export default function AddEventPage({ token }) {
  const [values, setValues] = useState({
    name: '',
    performers: '',
    venue: '',
    address: '',
    date: '',
    time: '',
    description: '',
    lat: '',
    lng: '',
  })
  
  const [image, setImage] = useState(null)
  const [loadingCoords, setLoadingCoords] = useState(false)
  const router = useRouter()

  const getCoordinates = async () => {
    if (!values.address) {
      toast.error('Tulis alamat dulu ya')
      return
    }

    setLoadingCoords(true)
    try {
      // Memanggil proxy API buatan kita sendiri
      const res = await fetch(`/api/geocoder?address=${encodeURIComponent(values.address)}`)
      const data = await res.json()

      if (data && data.length > 0) {
        setValues({ ...values, lat: data[0].lat, lng: data[0].lon })
        toast.success('Lokasi berhasil ditemukan!')
      } else {
        toast.error('Lokasi tidak ketemu, coba alamat yang lebih lengkap')
      }
    } catch (err) {
      toast.error('Error saat mencari koordinat')
    } finally {
      setLoadingCoords(false)
    }
  }

  const handleFileChange = (e) => {
    setImage(e.target.files[0])
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!values.lat || !values.lng) {
      toast.error('Klik tombol cari lokasi dulu untuk dapet koordinat')
      return
    }

    const slug = values.name.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-')

    const dataToSend = {
      ...values,
      slug: slug,
      lat: parseFloat(values.lat),
      lng: parseFloat(values.lng)
    }

    try {
      const res = await fetch(`${API_URL}/api/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data: dataToSend }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error?.message || 'Gagal simpan event')
        return
      }

      if (image) {
        const eventId = data.data.id
        const formData = new FormData()
        formData.append('files', image)
        formData.append('ref', 'api::event.event')
        formData.append('refId', eventId)
        formData.append('field', 'image')

        await fetch(`${API_URL}/api/upload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        })
      }

      toast.success('Sip! Event sudah terbuat')
      router.push('/events')
    } catch (error) {
      toast.error('Koneksi bermasalah')
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setValues({ ...values, [name]: value })
  }

  return (
    <Layout title='Add New Event'>
      <Link href='/events'>Go Back</Link>
      <h1>Add Event</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.grid}>
          <div>
            <label htmlFor='name'>Event Name</label>
            <input type='text' id='name' name='name' value={values.name} onChange={handleInputChange} required />
          </div>
          <div>
            <label htmlFor='performers'>Performers</label>
            <input type='text' name='performers' value={values.performers} onChange={handleInputChange} required />
          </div>
          <div>
            <label htmlFor='venue'>Venue</label>
            <input type='text' name='venue' value={values.venue} onChange={handleInputChange} required />
          </div>
          <div>
            <label htmlFor='address'>Address</label>
            <input type='text' name='address' value={values.address} onChange={handleInputChange} required />
            <button type='button' className='btn-secondary' style={{marginTop: '10px'}} onClick={getCoordinates} disabled={loadingCoords}>
              {loadingCoords ? 'Sabar ya...' : 'Cari Lokasi Otomatis'}
            </button>
          </div>
          <div>
            <label htmlFor='date'>Date</label>
            <input type='date' name='date' value={values.date} onChange={handleInputChange} required />
          </div>
          <div>
            <label htmlFor='time'>Time</label>
            <input type='text' name='time' value={values.time} onChange={handleInputChange} placeholder='19:00' required />
          </div>
          <div>
            <label htmlFor='lat'>Latitude</label>
            <input type='text' name='lat' value={values.lat} readOnly placeholder='Otomatis' />
          </div>
          <div>
            <label htmlFor='lng'>Longitude</label>
            <input type='text' name='lng' value={values.lng} readOnly placeholder='Otomatis' />
          </div>
        </div>

        <div>
          <label htmlFor='description'>Description</label>
          <textarea name='description' value={values.description} onChange={handleInputChange} required></textarea>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label htmlFor='image'>Cover Image (Opsional)</label>
          <input type='file' onChange={handleFileChange} />
        </div>

        <input type='submit' value='Add Event' className='btn' />
      </form>
    </Layout>
  )
}

export async function getServerSideProps({ req }) {
  const { token } = parseCookies(req)
  if (!token) return { redirect: { destination: '/account/login', permanent: false } }
  return { props: { token } }
}