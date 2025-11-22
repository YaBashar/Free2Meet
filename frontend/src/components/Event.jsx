import { useParams } from 'react-router-dom'
import { useAxiosPrivate } from '../hooks/useAxiosPrivate';
import { useEffect, useState } from 'react';
import { ShareEventDialog } from './ShareEventDialog'

// Conditional rendering for attendee and organiser.

const Event = () => {
  
  const { id } = useParams();

  const axiosPrivate = useAxiosPrivate();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isOrganiser, setIsOrganiser] = useState(false);

  useEffect(() => {
    const getEvent = async () => {
      try {
        const response = await axiosPrivate.get(`/events/${id}`);
        setEvent(response.data.event);
    
      } catch (error) {
        console.log(JSON.stringify(error.response.data.error));
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      getEvent();
    } else {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

   useEffect(() => {
    const getUserName = async () => {
      try {
        const response = await axiosPrivate.get('/auth/user-details');
        if ((response.data.user.name) === event.organiser) {
          setIsOrganiser(true);
        }
      } catch (err) {
        console.error(err);
      }
    }

    getUserName();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return <div className="p-10">Loading...</div>;
  }

  if (!event) {
    return <div className="p-10">No event found</div>;
  }

  return (
    <>
      <div className = "w-[400px] h-[475px] flex flex-col items-center justify-center m-5 frosted rounded-4xl text-black">

        <div className={isOrganiser ? "w-[200px] justify-between flex" : ""}>
          <p className='text-3xl'>Event Info</p>
          {isOrganiser && <ShareEventDialog eventId={id} />}
        </div>

        <p className='mt-5 text-3xl'>{event.title}</p>
        <p className='mt-5 text-3xl'>{event.description}</p>
        <p className='mt-5 text-3xl'>{event.location}</p>
        <p className='mt-5 text-3xl'>{event.date}</p>
        <p className='mt-5 text-3xl'>{event.startTime} to {event.endTime}</p>
      </div>
    </>
  )
}

export default Event