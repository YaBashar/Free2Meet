import { useParams } from 'react-router-dom'
import { useAxiosPrivate } from '../hooks/useAxiosPrivate';
import { useEffect, useState } from 'react';
import { ShareIcon } from '@heroicons/react/24/outline';
import { ShareEventDialog } from './ShareEventDialog'

const Event = () => {
  
  const { id } = useParams();
  const axiosPrivate = useAxiosPrivate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {

    const getEvent = async () => {
      try {
        console.log("4. Inside try catch function");
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

  if (loading) {
    return <div className="p-10">Loading...</div>;
  }

  if (!event) {
    return <div className="p-10">No event found</div>;
  }

  return (

    <>
      <div className = "w-[400px] h-[500px] flex flex-col items-center m-5 frosted rounded-4xl text-black">

        <div className = "w-[200px] justify-between flex mt-10">
          <p className='text-3xl'>
            Event Info 
          </p>

          <ShareEventDialog
            eventId = {id}
          ></ShareEventDialog>

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