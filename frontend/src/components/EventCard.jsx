import { TrashIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline'
import { EventEditDialog } from './EventEditDialog'
import { useNavigate } from 'react-router-dom'

const EventCard = ({event, handleDelete, state, dispatch, setData}) => {
    
    const navigate = useNavigate();
  
    return (
    <div className="card-base">
        <div className="flex flex-col">
            <p>{event.title}</p>
            <p>{event.description}</p>
            <p>{event.location}</p>
        </div>
        
        <div className="mt-2 flex w-[100px] justify-evenly">
            <button onClick = {() => handleDelete(event.eventId) } className="cursor-pointer">
                <TrashIcon className="h-5 w-5 ">
                </TrashIcon>
            </button>

            <EventEditDialog
                state = {state}
                dispatch = {dispatch}
                setData = {setData}
                event = {event}>
            </EventEditDialog>

            <button className="cursor-pointer" onClick={() =>  navigate(`/events/${event.eventId}`)} >
                <ArrowTopRightOnSquareIcon 
                    className="h-5 w-5 mx-1"
                ></ArrowTopRightOnSquareIcon>
            </button>
        </div>
    </div>
  )
}

export default EventCard