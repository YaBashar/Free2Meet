import axios from '../api/axios';
import FormInput from './FormInput'
import { useState, useEffect } from 'react';

const Login = () => {
    const LOGIN_URL = '/auth/login'
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 
    const [password, setPassword] = useState('');
    const [validPassword, setValidPassword] = useState(false);

    const[email, setEmail] = useState('');
    const[validEmail, setValidEmail] = useState(false);
    
    useEffect(() => {
        const result = passwordRegex.test(password);
        console.log(result);
        console.log(password);
        setValidPassword(result);
      }, [password, passwordRegex]);
    
      const handlePasswordChange = (e) => {
        setPassword(e.target.value);
      }
    
      useEffect(() => {
        const result = emailRegex.test(email);
        console.log(result);
        console.log(email);
        setValidEmail(result);
      }, [email, emailRegex]);
    
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
        <h1 className="p-5 mt-[20px] text-center text-4xl">Login</h1>

        <div className= "form-container">
          <form className="flex flex-col justify-center" onSubmit = {handleSubmit}>

            <div className="flex flex-col mt-[10px]">
                <FormInput 
                  label = {"Email"} 
                  placeholder = {"Enter Email"} 
                  inputId = {"email"}
                  onChange = {handleEmailChange}
                  isValid = {validEmail}
                />
            </div>

            <div className="flex flex-col mt-[10px]">
                <FormInput 
                  label = {"Password"} 
                  placeholder = {"Enter Password"} 
                  inputId = {"password"}
                  onChange = {handlePasswordChange}
                  isValid = {validPassword}
                />
            </div>

            <button className="button-base">Sign In</button>
          </form>
        </div>   
    </>
  )
}

export default Login