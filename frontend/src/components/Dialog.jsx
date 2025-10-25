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

function DialogDemo() {

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

    console.log({ title, description, location, date, startTime, endTime });

    try {
        const response = await axiosPrivate.post(EVENT_URL, { title, description, location, date, startTime, endTime });
        
        if (response.status === 200) {
            const recievedEventId = response.data.eventId;
            alert(`Successfully Created Event with EventId ${recievedEventId}`);
        }

    } catch (err) {
        console.log(JSON.stringify(err.response.data.error));
    }

    // Process your form data here
  };

  return (
    <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="cursor-pointer">New Event</Button>
        </DialogTrigger>
      <form>
        <DialogContent className="sm:max-w-[425px] bg-amber-50 text-black">
          <DialogTitle>New Event</DialogTitle>
          <div className="grid gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="name-1">Event Title</Label>
              <Input id="name-1" name="name" onChange = {(e) => setTitle(e.target.value)}/>
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="username-1">Description</Label>
              <Input id="username-1" name="username" onChange = {(e) => setDescription(e.target.value)} />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="username-1">Location</Label>
              <Input id="username-1" name="username" onChange = {(e) => setLocation(e.target.value)} />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="username-1">Date</Label>
              <Input id="username-1" name="username" onChange = {(e) => setDate(e.target.value)} />
            </div>

            <div className="flex">
                <div className="grid gap-1.5">
                    <Label htmlFor="username-1">Start Time</Label>
                    <Input id="username-1" name="username" onChange = {(e) => setStartTime(e.target.value)} />
                </div>

                <div className="grid gap-1.5">
                    <Label htmlFor="username-1">End Time</Label>
                    <Input id="username-1" name="username" onChange = {(e) => setEndTime(e.target.value)} />
                </div>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button className="cursor-pointer">Cancel</Button>
            </DialogClose>
            
            <Button type="submit" className="cursor-pointer" onClick = {handleSubmit}>Submit</Button>
          
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}

export { DialogDemo}