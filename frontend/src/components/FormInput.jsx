import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

//TODO
// // X icon for invalid inputs
// Show / Hide Password

const FormInput = ({ label, placeholder, inputId, onChange, isValid}) => {
  
  return (
    <>
      <label className = "flex text-marian-blue" htmlFor="lname">
        {label}
        {isValid ? (<CheckCircleIcon className="h-5 w-5 mx-1 fill-marian-blue" />) : ( <XCircleIcon className="h-5 w-5 fill-marian-blue" /> )}
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