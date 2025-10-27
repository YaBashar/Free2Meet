import axios from '../api/axios'

const useRefreshToken = () => {

    const refresh = async() => {
        const response = await axios.get('/auth/refresh', {
            withCredentials: true
        });

        const accessToken = response.data.token;
        return accessToken;
    }
  
    return refresh;
}


export { useRefreshToken }