import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShareIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import { useAxiosPrivate } from '../hooks/useAxiosPrivate'

function ShareEventDialog({ eventId }) {

  const [link, setLink] = useState("");
  const axiosPrivate = useAxiosPrivate();

  const getEventInviteLink = async () => {
    try {
        const response = await axiosPrivate.post(`/events/${eventId}/invite`)
        setLink(response.data.link)
    } catch (error) {
        console.log(JSON.stringify(error.response.data.error));
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
        variant="outline" 
        className="cursor-pointer"
        onClick = {() => getEventInviteLink()}
        >
            <ShareIcon/>
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-white text-black">
        <DialogHeader>
          <DialogTitle>Share link</DialogTitle>
          <DialogDescription>
            Anyone who has this link will be able to view this.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="link" className="sr-only">
              Link
            </Label>


            <div className="relative">
                <Input
                    id="link"
                    value = {link}
                    readOnly
                    className="truncate pr-12"
                />

                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full cursor-pointer hover:bg-red-300"
                    onClick={() => {
                        alert("Link copied");
                        navigator.clipboard.writeText(link);
                    }}
                >
                    <DocumentDuplicateIcon className="h-4 w-4" />
                    <span className="sr-only">Copy</span>
                </Button>
            </div>


          </div>
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogClose asChild>
            <Button type="button" variant="secondary" className= "cursor-pointer hover:bg-red-300">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export { ShareEventDialog }
