import { EventInputDialog } from './EventInputDialog'
import { useState, useEffect } from 'react'
import { useAxiosPrivate } from '../hooks/useAxiosPrivate';
import { TrashIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'

const Dashboard = () => {
    
  const [ data, setData ] = useState([]);
  const axiosPrivate = useAxiosPrivate();
  
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

  return (
    <>
        <div className = "flex flex-col m-3 w-[1090px] rounded-xl frosted">
            <h1 className="ml-5 mt-2 mb-2 text-xl text-black text-[30px] text-">Welcome Back</h1>

            <div className='w-full'>
                <h1 className="ml-5 text-black">My Events</h1>

                <div className= "flex flex-row flex-wrap ml-5 justify-start ">
                    <div className="card-base">
                        <EventInputDialog setData = {setData} ></EventInputDialog>
                    </div>
                    
                    {data.map(item => (
                        <div className="card-base" key={item.eventId}>
                            <div className="flex flex-col">
                                <p>{item.title}</p>
                                <p>{item.description}</p>
                                <p>{item.location}</p>
                            </div>
                            
                            <div className="mt-2 w-[100px] border-solid border-delft-blue">
                                <button className="cursor-pointer">
                                    <TrashIcon className="ml-[5px] h-5 w-5 mx-1"></TrashIcon>
                                </button>

                                <button className="cursor-pointer">
                                    <ArrowTopRightOnSquareIcon className="ml-[5px] h-5 w-5 mx-1">
                                    </ArrowTopRightOnSquareIcon>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </> 
  )
}

export default Dashboard