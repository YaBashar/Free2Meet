import axios from 'axios';
const BASE_URL = 'http://localhost:3229'


export default axios.create({
    baseURL: BASE_URL,
    withCredentials: true
})

export const axiosPrivate =  axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
    headers: {'Content-Type': 'application/json'}
})