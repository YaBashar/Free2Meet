
import { PencilSquareIcon } from '@heroicons/react/24/outline'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { useEffect } from 'react'
import { useAxiosPrivate } from '../hooks/useAxiosPrivate'

// TODO:
// Validate form fields based on backend restrictions

function EventEditDialog ({ setData, event, state, dispatch }) {

  const axiosPrivate = useAxiosPrivate();
  const { title, description, location, date, startTime, endTime } = state;
  const eventId = event.eventId;
  const EVENT_URL = `/events/${eventId}`


  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !description || !location || !date || !startTime || !endTime) {
      alert('Please fill in all fields');
      return;
    }

    try {
        const response = await axiosPrivate.put(EVENT_URL, { title, description, location, date, startTime, endTime });
        
        if (response.status === 200) {
            setData(() => [{
              eventId: eventId,
              title,
              description, 
              location,
              date, 
              startTime, 
              endTime
            }])
        }

    } catch (err) {
        console.log(JSON.stringify(err.response.data.error));
    }

  };

  const handleFieldChange = (field) => (e) => {
    dispatch({ type: 'UPDATE_EVENT', field, value: e.target.value });
  }

  useEffect(() => {
    if (event) {
      dispatch({ 
        type: 'NEW_EVENT', 
        payload: {
          title: event.title,
          description: event.description,
          location: event.location,
          date: event.date,
          startTime: event.startTime,
          endTime: event.endTime
        }
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [event]);

  return (
    <Dialog>
        <DialogTrigger asChild>
          <button className = "cursor-pointer">
            <PencilSquareIcon className="h-5 w-5"></PencilSquareIcon>
          </button>
        </DialogTrigger>

      <form>
        <DialogContent className="sm:max-w-[425px] bg-blue-100 text-black">
          <DialogTitle>Edit Event</DialogTitle>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="title">Event Title</Label>
              <Input id="title" name="eventTitle" value = {state.title} onChange = {handleFieldChange('title')}/>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="description">Description</Label>
              <Input 
                id="description" 
                name="eventDesc" 
                value={state.description}
                onChange={handleFieldChange('description')} 
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor ="location">Location</Label>
              <Input 
                id ="location" 
                name="eventLocation" 
                value={state.location}
                onChange={handleFieldChange('location')} 
              />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="date">Date</Label>
              <Input 
                id="date" 
                name="eventDate" 
                type="date" 
                value={state.date}
                onChange={handleFieldChange('date')}
              />
            </div>

            <div className="flex">
                <div className="grid gap-1.5">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input 
                      id="startTime" 
                      name="startTime" 
                      value={state.startTime}
                      onChange={handleFieldChange('startTime')} 
                    />
                </div>

                <div className="grid gap-1.5">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input 
                      id="endTime" 
                      name="endTime" 
                      value={state.endTime}
                      onChange={handleFieldChange('endTime')} 
                    />
                </div>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="cursor-pointer">Cancel</Button>
            </DialogClose>
            
            <Button variant="outline" type="submit" className="cursor-pointer" onClick = {handleSubmit}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}

export { EventEditDialog }