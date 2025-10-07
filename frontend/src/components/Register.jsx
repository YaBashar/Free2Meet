import FormInput from "./FormInput"
import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { Link } from 'react-router-dom';

// TODO


const Register = () => {
  const firstNameRegex = /^[a-zA-Z0-9 ]{2,10}$/;
  const lastNameRegex = /^[a-zA-Z0-9 ]{2,10}$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 
  const REGISTER_URL = '/auth/register'

  const [firstName, setFirstName] = useState('');
  const [validFirstName, setValidFirstName] = useState(false);

  const [lastName, setLastName] = useState('');
  const [validLastName, setValidLastName] = useState(false);

  const [password, setPassword] = useState('');
  const [validPassword, setValidPassword] = useState(false);

  const[email, setEmail] = useState('');
  const[validEmail, setValidEmail] = useState(false);
 
  useEffect(() => {
    const result = firstNameRegex.test(firstName);
    console.log(result);
    console.log(firstName);
    setValidFirstName(result);
  }, [firstName, firstNameRegex]);

  const handleFirstNameChange = (e) => {
    setFirstName(e.target.value);
  }

  useEffect(() => {
    const result = lastNameRegex.test(lastName);
    console.log(result);
    console.log(lastName);
    setValidLastName(result);
  }, [lastName, lastNameRegex]);

  const handleLastNameChange = (e) => {
    setLastName(e.target.value);
  }

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
      const response = await axios.post(REGISTER_URL, 
        JSON.stringify({ firstName, lastName, password, email}), 
        {
          headers: {'Content-Type': 'application/json'},
          withCredentials: true
        }
      );
      
      console.log(JSON.stringify(response.userId));
    } catch (err) {
      console.log(JSON.stringify(err.response.data.error));
    }
  }

  return(
      <>
        <h1 className="p-5 mt-[20px] text-center text-4xl">Welcome</h1>

        <div className= "form-container">
          <form className="flex flex-col justify-center" onSubmit = {handleSubmit}>

            <div className="flex flex-1 justify-between w-[455px]">
              <div className="flex flex-col w-[225px]">           
                <FormInput 
                  label = {"First Name"} 
                  placeholder = {"Enter First Name"} 
                  inputId = {"fname"} 
                  onChange = {handleFirstNameChange}
                  isValid = {validFirstName}
                />
                </div>

              <div className="flex flex-col w-[225px]">
                <FormInput 
                  label = {"Last Name"} 
                  placeholder = {"Enter Last Name"} 
                  inputId = {"lname"}
                  onChange = {handleLastNameChange}
                  isValid = {validLastName}
                />
              </div>
            </div>

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

            <button className="button-base">Sign Up</button>
          </form>

          <p className='text-center p-2'>
            Already Registered? <br/>
            <span>
             <Link to = "/login">Sign In</Link>
            </span>
          </p>

        </div>
        
      
      </>
    )
}

export default Register