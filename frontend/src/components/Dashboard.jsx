import { useAxiosPrivate } from '../hooks/useAxiosPrivate';
import { useLocation, useNavigate } from 'react-router-dom';

const Dashboard = () => {
    
    const USER_URL = '/auth/user-details'
    const axiosPrivate = useAxiosPrivate();
    const navigate = useNavigate();
    const location = useLocation();

    const handleClick = async() => {

        try {
            const response = await axiosPrivate.get(USER_URL);
            console.log(JSON.stringify(response));

        } catch (err) {
            console.log(JSON.stringify(err.response.data.error));
            navigate('/login', { state: { from: location }, replace: true})
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