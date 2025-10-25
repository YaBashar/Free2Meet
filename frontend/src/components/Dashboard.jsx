import { DialogDemo } from './Dialog'

const Dashboard = () => {
    
  return (
    <>
        <div className = "flex flex-col m-3 w-[1090px] rounded-xl frosted">
            <h1 className="ml-5 mt-2 mb-2 text-xl text-black text-[30px] text-">Welcome Back</h1>

            <div className='w-full'>
                <h1 className="ml-5 text-black">My Events</h1>

                <div className= "flex flex-row flex-wrap ml-5 justify-start ">
                    <div className="w-[150px] h-[150px] bg-red-100 m-5 flex rounded-xl justify-center items-center text-black">
                        <DialogDemo></DialogDemo>
                    </div>
                    
                    <div className="w-[150px] h-[150px] bg-black m-5 rounded-xl"></div>
                    <div className="w-[150px] h-[150px] bg-red-500 m-5 rounded-xl"></div>
                </div>
            </div>

            <div className='w-full'>
                <h1 className="ml-5 text-black">Attending Events</h1>
                <div className= "flex flex-row flex-wrap ml-5">
                    <div className="w-[150px] h-[150px] bg-red-100 m-5 rounded-xl"></div>
                    <div className="w-[150px] h-[150px] bg-red-100 m-5 rounded-xl"></div>
                    <div className="w-[150px] h-[150px] bg-red-100 m-5 rounded-xl"></div>   
                </div>
            </div>
        </div>
    </> 
  )
}

export default Dashboard