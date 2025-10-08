import React from 'react'
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {

  const navigate = useNavigate();

  return (
    <>
        <div className='flex flex-col items-center justify-center min-h-screen'> 
            <div>
                <h1 className="p-5 text-center text-4xl">Welcome to Free2Meet</h1>
            </div>

            <div className = "flex w-[250px]">
                <button className='button-base' onClick={() => {navigate("/signup")}}>Sign Up</button>
                <button className='button-base' onClick={() => {navigate("/login")}}>Login</button>
            </div>
        </div>
    </>
  )
}

export default LandingPage