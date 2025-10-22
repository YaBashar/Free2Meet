import axios from '../api/axios';
import { useAuth } from '../hooks/useAuth';


const Dashboard = () => {

    const USER_URL = '/auth/user-details'
    const { accessToken } = useAuth();

    const handleClick = async() => {

        try {
            const response = await axios.get(
                USER_URL, 
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`
                    },
                    withCredentials: true
                }
            );

            console.log(JSON.stringify(response));

        } catch (err) {
            console.log(JSON.stringify(err.response.data.error));
        }
    }

    

  return (
    <>
        <div className="text-red-400">Dashboard</div>
        <button onClick={handleClick}>Click Me</button>
    </>
    
  )
}

export default Dashboard