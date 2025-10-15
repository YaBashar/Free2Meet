import axios from '../api/axios';
import useValidateLoginForm from '../hooks/useValidateLoginForm';
import FormInput from './FormInput'
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const LOGIN_URL = '/auth/login'

    const navigate = useNavigate();
    const { password, email, validEmail, validPassword, handleEmailChange, handlePasswordChange } = useValidateLoginForm()
   
    
      const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(LOGIN_URL, 
                JSON.stringify({ email, password}), 
                {
                    headers: {'Content-Type': 'application/json'},
                    withCredentials: true
                }
            );

            console.log(JSON.stringify(response));

            navigate('/dashboard');
        } catch (err) {
            console.log(JSON.stringify(err.response.data.error));
        }
      }
 
    return (

    <>
        <h1 className="p-5 mt-[20px] text-center text-5xl">Login</h1>

        <div className= "flex flex-col justify-around form-container frosted rounded-3xl shadow-2xl backdrop-blur-3xl">
          <form className=" text-marian-blue" onSubmit = {handleSubmit}>

            <div className="flex flex-col p-2">
                <FormInput 
                  label = {"Email"} 
                  placeholder = {"Enter Email"} 
                  inputId = {"email"}
                  onChange = {handleEmailChange}
                  isValid = {validEmail}
                />
            </div>

            <div className="flex flex-col p-2">
                <FormInput 
                  label = {"Password"} 
                  placeholder = {"Enter Password"} 
                  inputId = {"password"}
                  onChange = {handlePasswordChange}
                  isValid = {validPassword}
                  type= {"password"}
                />
            </div>

            <button className="button-base">Sign In</button>
          </form>
        </div>   
    </>
  )
}

export default Login