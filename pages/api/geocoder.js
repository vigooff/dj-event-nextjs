export default async function handler(req, res) {
  const { address } = req.query

  if (!address) {
    return res.status(400).json({ message: 'Alamat harus diisi' })
  }

  try {
    const nominatimRes = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`,
      {
        headers: {
         
          'User-Agent': 'DJEventsApp/1.0',
        },
      }
    )

    const data = await nominatimRes.json()
    res.status(200).json(data)
  } catch (error) {
    res.status(500).json({ message: 'Gagal mengambil data koordinat' })
  }
}