import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAxiosPrivate } from '../hooks/useAxiosPrivate';

// Decide what user sees after accepting
// Decide rejection flow -> direct to dashboard
// Decide how organiser and attendees see event selection page

const InvitePage = () => {

  const [event, setEvent ] = useState(null);
  const [loading, setLoading] = useState(true);

  const { inviteLink } = useParams();
  const { accessToken } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();
  const axiosPrivate = useAxiosPrivate();

  useEffect(() => {
    if (!accessToken) {
      alert("Login to access invite details")
      navigate('/login', { state: { from: location.pathname }});
    }
  }, [accessToken, navigate, location.pathname]);
  
  
  useEffect(() => {
    if (!accessToken) return;

    const getInviteDetails = async() => {
      try {
        const response = await axiosPrivate.get(`/events/invite/${inviteLink}`);
        setEvent(response.data.event);
      } catch (err) {
        console.log(JSON.stringify(err.response.data.error));
      } finally {
        setLoading(false);
      } 
    } 

    if (inviteLink) {
        getInviteDetails();
    } else {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inviteLink])


  const handleAccept = async () => {
    try {
      await axiosPrivate.post('/attendees/respond', {inviteLink, action: 'accept'});
      navigate(`/events/${event.id}`, {replace: true});
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!event) {
    return <div>Invite not found or expired.</div>;
  }

  return (
    <>
        <div className= "flex flex-col items-center text-black mt-[75px] form-container frosted rounded-3xl shadow-2xl backdrop-blur-3xl">
            <h1>{event.organiser} invites you to</h1>
            <p>{event.title}</p>
            <p>{event.description}</p>
            <p>{event.location}</p>
            <p>{event.date}</p>
            <p>{event.startTime} to {event.endTime}</p>


            <div className="flex mt-5 w-[200px] justify-around">
                <button className="border-2 border-solid border-delft-blue p-2 cursor-pointer hover:text-white hover:bg-delft-blue" onClick = {handleAccept}>Accept</button>
                <button className="border-2 border-solid border-delft-blue p-2 cursor-pointer hover:text-white hover:bg-delft-blue">Reject</button>
            </div>

        </div>   
    </>
  )
}

export default InvitePage