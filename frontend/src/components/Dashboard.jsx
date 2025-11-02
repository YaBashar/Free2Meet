import { EventInputDialog } from './EventInputDialog'
import { useState, useEffect } from 'react'
import { useAxiosPrivate } from '../hooks/useAxiosPrivate';
import EventCard from './EventCard';
import useEventForm from '../hooks/useEventForm'

const Dashboard = () => {
    
  const [ data, setData ] = useState([]);
  const axiosPrivate = useAxiosPrivate();
  const { state, dispatch } = useEventForm()
  
  useEffect(() => {
    const fetch = async() => {
        try {
            const result = await axiosPrivate.get('/events/organised-events');
            const events = result.data.events;
            setData(events)
        } catch (error) {
            console.log(JSON.stringify(error.response.data.error));
        }
    }

    fetch();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id) => {
    try {
        await axiosPrivate.delete(`/events/${id}`);
        setData(items => items.filter(item => item.eventId !== id))
    } catch (error) {
        console.log(JSON.stringify(error.response.data.error));
    }
  }

  return (
    <>
        <div className = "flex flex-col w-screen rounded-xl frosted">
            <h1 className="ml-10 mt-10 mb-2 text-xl text-black text-[30px] text-">Welcome Back</h1>
                <h1 className="ml-10 text-black">My Events</h1>

                <div className= "flex flex-row flex-wrap ml-5 justify-start ">
                    <div className="card-base">
                        <EventInputDialog 
                            state = {state} 
                            dispatch = {dispatch} 
                            setData = {setData} 
                        ></EventInputDialog>
                    </div>
                    
                    {data.map(item => (
                        <EventCard
                         key={item.eventId}
                         event = {item}
                         handleDelete={handleDelete}
                         state = {state}
                         dispatch = {dispatch}
                         setData = {setData}
                        ></EventCard>
                    ))}
                </div>
            </div>
    </> 
  )
}

export default Dashboard