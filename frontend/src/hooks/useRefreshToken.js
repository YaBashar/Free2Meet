import axios from '../api/axios'
import { useAuth } from './useAuth'

const useRefreshToken = () => {

    const { signIn } = useAuth();
  
    const refresh = async() => {
        const response = await axios.get('/auth/refresh', {
            withCredentials: true
        });

        const accessToken = response.data.token;
        signIn(accessToken);
    }
  
    return refresh;
}


export { useRefreshToken }