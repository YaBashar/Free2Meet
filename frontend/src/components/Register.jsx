import FormInput from "./FormInput"
import axios from '../api/axios';
import { Link } from 'react-router-dom';
import { useValidateSignUpForm } from '../hooks/useValidateSignUpForm';


const Register = () => {
 
  const REGISTER_URL = '/auth/register'

  const {values, valid, handleChange} = useValidateSignUpForm();
  const {firstName, lastName, password, email} = values;

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
        <h1 className="p-5 text-center text-5xl">Welcome</h1>

        <div className= "form-container frosted rounded-3xl shadow-2xl backdrop-blur-3xl text-marian-blue">
          <form className="flex flex-col justify-center" onSubmit = {handleSubmit}>

            <div className="flex flex-1 justify-between w-[455px]">
              <div className="flex flex-col w-[225px]">           
                <FormInput 
                  label = {"First Name"} 
                  placeholder = {"Enter First Name"} 
                  inputId = {"fname"} 
                  onChange = {handleChange}
                  isValid = {valid.firstName}
                />
                </div>

              <div className="flex flex-col w-[225px]">
                <FormInput 
                  label = {"Last Name"} 
                  placeholder = {"Enter Last Name"} 
                  inputId = {"lname"}
                  onChange = {handleChange}
                  isValid = {valid.lastName}
                />
              </div>
            </div>

            <div className="flex flex-col mt-[10px]">
                <FormInput 
                  label = {"Email"} 
                  placeholder = {"Enter Email"} 
                  inputId = {"email"}
                  onChange = {handleChange}
                  isValid = {valid.email}
                />
            </div>

            <div className="flex flex-col mt-[10px]">
                <FormInput 
                  label = {"Password"} 
                  placeholder = {"Enter Password"} 
                  inputId = {"password"}
                  onChange = {handleChange}
                  isValid = {valid.password}
                  type = {"password"}
                />

            </div>

            <button className="button-base text-marian-blue">Sign Up</button>
          </form>

          <p className='text-center text-delft-blue p-2'>
            Already Registered? <br/>
            <span>
             <Link to = "/login" className='text-delft-blue underline'>Sign In</Link>
            </span>
          </p>

        </div>
        
      
      </>
    )
}

export default Register