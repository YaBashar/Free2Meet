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

import { useState } from 'react'
import { useAxiosPrivate } from '../hooks/useAxiosPrivate'

// TODO:
// Validate form fields based on backend restrictions

function EventInputDialog ({ setData }) {

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const axiosPrivate = useAxiosPrivate();
  const EVENT_URL = '/events/new-event'

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title || !description || !location || !date || !startTime || !endTime) {
      alert('Please fill in all fields');
      return;
    }

    try {
        const response = await axiosPrivate.post(EVENT_URL, { title, description, location, date, startTime, endTime });
        
        if (response.status === 200) {
            const recievedEventId = response.data.eventId;
            setData(prevData => [...prevData, {
              eventId: recievedEventId,
              title,
              description, 
              location,
              date, 
              startTime, 
              endTime
            }])
            
            alert(`Successfully Created Event with EventId ${recievedEventId}`);
        }

    } catch (err) {
        console.log(JSON.stringify(err.response.data.error));
    }

  };

  return (
    <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="cursor-pointer">New Event</Button>
        </DialogTrigger>
      <form>
        <DialogContent className="sm:max-w-[425px] bg-blue-100 text-black">
          <DialogTitle>New Event</DialogTitle>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="title">Event Title</Label>
              <Input id="title" name="eventTitle" onChange = {(e) => setTitle(e.target.value)}/>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="description">Description</Label>
              <Input id="description" name="eventDesc" onChange = {(e) => setDescription(e.target.value)} />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor ="location">Location</Label>
              <Input id ="location" name="eventLocation" onChange = {(e) => setLocation(e.target.value)} />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="date">Date</Label>
              <Input id="date" name="eventDate" type = "date" onChange = {(e) => setDate(e.target.value)}></Input>
            </div>

            <div className="flex">
                <div className="grid gap-1.5">
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input id="startTime" name="startTime" onChange = {(e) => setStartTime(e.target.value)} />
                </div>

                <div className="grid gap-1.5">
                    <Label htmlFor="endTime">End Time</Label>
                    <Input id="endTime" name="endTime" onChange = {(e) => setEndTime(e.target.value)} />
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

export { EventInputDialog }