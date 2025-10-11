import axios from '../api/axios';
import FormInput from './FormInput'
import { useState, useEffect } from 'react';

const Login = () => {
    const LOGIN_URL = '/auth/login'

    const [password, setPassword] = useState('');
    const [validPassword, setValidPassword] = useState(false);

    const[email, setEmail] = useState('');
    const[validEmail, setValidEmail] = useState(false);
    
    useEffect(() => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;
        const result = passwordRegex.test(password);
        console.log(result);
        console.log(password);
        setValidPassword(result);
      }, [password]);
    
      const handlePasswordChange = (e) => {
        setPassword(e.target.value);
      }
    
      useEffect(() => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const result = emailRegex.test(email);
        console.log(result);
        console.log(email);
        setValidEmail(result);
      }, [email]);
    
      const handleEmailChange = (e) => {
        setEmail(e.target.value);
      }
    
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