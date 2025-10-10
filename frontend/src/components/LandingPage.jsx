import logo from '../assets/logo.png';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <>
        <div className='flex flex-col items-center justify-center min-h-screen'> 
            <div className = 'flex flex-col justify-center items-center frosted rounded-3xl min-h-[425px] min-w-[750px] shadow-2xl backdrop-blur-3xl'>
               <div className = 'flex flex-col items-center'>
                  <h1 className="text-delft-blue font-medium p-2 text-center text-5xl ">Welcome to Free2Meet</h1>
                  <h1 className="text-delft-blue font-medium p-2 text-center text-4xl ">Hangouts made easy</h1>
                  <img className="image" src= {logo}></img>
              </div>

              <div className = "flex w-[250px]">
                  <button className='text-delft-blue font-medium button-base' onClick={() => {navigate("/signup")}}>Sign Up</button>
                  <button className='text-delft-blue font-medium button-base' onClick={() => {navigate("/login")}}>Login</button>
              </div>
            </div>     
        </div>
    </>
  )
}

export default LandingPage