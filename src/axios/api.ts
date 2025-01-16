import axios from 'axios'

const api = axios.create({
 baseURL: 'http://localhost:3000/api',
})


export const fetchData = async () => {
  try {
    const response = await api.get('/user')
    return response.data
  } catch (error) {
    console.error('Error fetching data:', error)
    throw error
  }
}
