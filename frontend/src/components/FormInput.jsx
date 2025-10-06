const FormInput = ({ label, placeholder, inputId }) => {
  return (
    <>
    <label htmlFor="lname">{label}</label>
    <input className="input-base" type="text" id= {inputId} placeholder= {placeholder}></input>
    </>
  )
}

export default FormInput;