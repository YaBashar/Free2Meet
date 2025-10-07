import { CheckCircleIcon, XCircleIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

//TODO
// // X icon for invalid inputs
// Show / Hide Password

const FormInput = ({ label, placeholder, inputId, onChange, isValid}) => {
  
  return (
    <>
      <label className = "flex" htmlFor="lname">
        {label}
        {isValid ? (<CheckCircleIcon className="h-5 w-5 text-green-500" />) : ( <XCircleIcon className="h-5 w-5 text-green-500" /> )}
      </label>
      
      <input 
        className ="input-base" 
        type ="text"
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