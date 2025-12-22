import { parseCookies } from '@/helpers/index'
import { toast } from 'react-toastify'
import { useState, useEffect } from 'react'
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
  })

  const router = useRouter()
  
  useEffect(() => {
    if (!token) {
        console.log('Token not found');
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault()

    const hasEmptyFields = Object.values(values).some(
      (element) => element === ''
    )

    if (hasEmptyFields) {
      toast.error('Please fill in all fields')
      return
    }

    if (!token) {
        toast.error('Token hilang. Harap login kembali.');
        router.push('/account/login');
        return;
    }

    // 🔥 GENERATE SLUG DI FRONTEND
    const slug = values.name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-')     // Replace spaces with -
      .replace(/-+/g, '-');     // Replace multiple - with single -

    const dataToSend = {
      ...values,
      slug: slug
    };

    try {
        const res = await fetch(`${API_URL}/api/events`, { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ 
                data: dataToSend
            }),
        })

        if (!res.ok) {
            const errorText = await res.text();
            
            try {
                const errorResponse = JSON.parse(errorText);
                
                if (res.status === 403) {
                    toast.error('Access denied. Please check your permissions.');
                    
                    setTimeout(() => {
                        router.push('/account/login');
                    }, 3000);
                } else if (res.status === 401) {
                    toast.error('Invalid token. Please login again.');
                    router.push('/account/login');
                } else {
                    const errorMessage = errorResponse.error?.message || 'Something went wrong';
                    toast.error(`Error ${res.status}: ${errorMessage}`);
                }
            } catch (e) {
                toast.error(`Server Error ${res.status}: ${errorText.substring(0, 100)}`);
            }
            return;
        }

        const responseData = await res.json()
        
        let eventId, eventSlug;
        
        if (responseData.data) {
            eventId = responseData.data.id;
            
            if (responseData.data.slug) {
                eventSlug = responseData.data.slug;
            } else if (responseData.data.attributes?.slug) {
                eventSlug = responseData.data.attributes.slug;
            } else {
                const eventName = responseData.data.name || responseData.data.attributes?.name;
                eventSlug = eventName?.toLowerCase().replace(/\s+/g, '-');
            }
        } else if (responseData.id) {
            eventId = responseData.id;
            eventSlug = responseData.slug || responseData.name?.toLowerCase().replace(/\s+/g, '-');
        }

        toast.success('Event added successfully!');
        
        if (eventSlug && eventSlug !== 'undefined') {
            router.push(`/events/${eventSlug}`);
        } else if (eventId) {
            router.push(`/events/${eventId}`);
        } else {
            router.push('/events');
        }
        
    } catch (e) {
        toast.error(`Network error: ${e.message}`);
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
            <input
              type='text'
              id='name'
              name='name'
              value={values.name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor='performers'>Performers</label>
            <input
              type='text'
              name='performers'
              id='performers'
              value={values.performers}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor='venue'>Venue</label>
            <input
              type='text'
              name='venue'
              id='venue'
              value={values.venue}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor='address'>Address</label>
            <input
              type='text'
              name='address'
              id='address'
              value={values.address}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor='date'>Date</label>
            <input
              type='date'
              name='date'
              id='date'
              value={values.date}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label htmlFor='time'>Time</label>
            <input
              type='text'
              name='time'
              id='time'
              value={values.time}
              onChange={handleInputChange}
              placeholder='e.g. 19:00'
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor='description'>Event Description</label>
          <textarea
            type='text'
            name='description'
            id='description'
            value={values.description}
            onChange={handleInputChange}
            required
          ></textarea>
        </div>

        <input type='submit' value='Add Event' className='btn' />
      </form>
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

  return {
    props: {
      token,
    },
  }
}