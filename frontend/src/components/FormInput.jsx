import { CheckCircleIcon, XCircleIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';

// Show / Hide Password

const FormInput = ({ label, placeholder, inputId, onChange, isValid, type = "text"}) => {
  

  const [showPassword, setShowPassword ] = useState(false);
  const isPassword = type === "password";
  const inputType = (isPassword && !showPassword) ? "password" : "text";

  return (
    <>
      <label className = "flex text-marian-blue" htmlFor="lname">
        {label}
        {isValid ? (<CheckCircleIcon className="ml-[5px] h-5 w-5 mx-1 fill-marian-blue" />) : ( <XCircleIcon className="ml-[5px] h-5 w-5 fill-marian-blue" /> )}
      
        {isPassword && (
          <span 
            onClick={() => setShowPassword((prev) => !prev)}>
            {showPassword ? (
              <EyeIcon className="ml-[315px] h-5 w-5 fill-marian-blue" />
            ) : (
              <EyeSlashIcon className="ml-[315px] h-5 w-5 fill-marian-blue" />
            )}
          </span>
        )}
      
      </label>
      
      <input 
        className ="input-base" 
        type = {inputType}
        id = {inputId} 
        placeholder= {placeholder}
        onChange = {onChange}
        autoComplete="off"
        required
      ></input>
    </>
  )
}

export default FormInput;