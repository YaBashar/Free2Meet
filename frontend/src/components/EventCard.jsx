import { TrashIcon, ArrowTopRightOnSquareIcon, PencilSquareIcon } from '@heroicons/react/24/outline'


const EventCard = ({eventId, title, description, location, handleDelete}) => {
  return (
    <div className="card-base">
        <div className="flex flex-col">
            <p>{title}</p>
            <p>{description}</p>
            <p>{location}</p>
        </div>
        
        <div className="mt-2 w-[100px] border-solid border-delft-blue">
            <button onClick = {() => handleDelete(eventId) } className="cursor-pointer">
                <TrashIcon className="ml-[5px] h-5 w-5 mx-1">
                </TrashIcon>
            </button>

            <button className="cursor-pointer">
                <PencilSquareIcon className="ml-[5px] h-5 w-5 mx-1">
                </PencilSquareIcon>
            </button>

            <button className="cursor-pointer">
                <ArrowTopRightOnSquareIcon className="ml-[5px] h-5 w-5 mx-1">
                </ArrowTopRightOnSquareIcon>
            </button>
        </div>
    </div>
  )
}

export default EventCard