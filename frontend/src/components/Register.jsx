import FormInput from "./FormInput"

const Register = () => {
  return(
      <>
        <h1 className="p-5 mt-[20px] text-center text-4xl">Welcome</h1>

        <form className= "form-container">

          <div className="flex flex-1 justify-between w-[455px]">
             <div className="flex flex-col w-[225px]">
                <FormInput label = {"First Name"} placeholder = {"Enter First Name"} inputId = {"fname"}/>
              </div>

            <div className="flex flex-col w-[225px]">
              <FormInput label = {"Last Name"} placeholder = {"Enter Last Name"} inputId = {"lname"}/>
            </div>
          </div>

          <div className="flex flex-col mt-[10px]">
              <FormInput label = {"Email"} placeholder = {"Enter Email"} inputId = {"email"}/>
          </div>

          <div className="flex flex-col mt-[10px]">
              <FormInput label = {"Password"} placeholder = {"Enter Password"} inputId = {"password"}/>
          </div>

          <button className="button-base">Submit</button>
          
        </form>
      
      </>
    )
}

export default Register