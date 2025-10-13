import MainLayout from "../Layout/MainLayout";
import { useForm} from "react-hook-form";
import {Input} from '../props/FormProps'
import type{SubmitHandler} from "react-hook-form";
import type {IFormInput} from '../props/FormProps'
import { AuthNav } from "../components/AuthNavigation";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
export const Login = () =>{
  const navigate = useNavigate()
  const {register, handleSubmit, formState: {errors}} = useForm<IFormInput>({defaultValues : {email: "", password: ""}})
  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
  try{
    const res = await fetch("http://localhost:8080/login",{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: data.email,
        password: data.password
      }),
    });
    if(!res.ok){
      const err = await res.json();
      alert(err.detail || "Invalid credentials")
    }
    const tokenData = await res.json()
    console.log("Login response:", tokenData)
    localStorage.setItem("access_token", tokenData.access_token)
    localStorage.setItem("token_type", tokenData)
    alert("Login Successful")
    navigate("/post")
  }
  catch(error){
    console.log("Login Error:", error)
    alert("Error while logging in");
  }
}
  useEffect(() => {
   const token = localStorage.getItem("access_token");
    if (token) {
      navigate("/post"); 
    }
  }, [navigate])
  return (
    <MainLayout title="Login">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input type = "email" placeholder = "Email" label="email" register={register} rules={{required: true}}/>
        {errors.email && <span style={{color: 'red'}}>*Email* is mandatory</span>}
        <Input type = "password" placeholder = "Password" label="password" register={register} rules={{required:true, pattern: {
                  value: /^(?=.*[A-Z])(?=.*\d).+$/,
                  message: "Must contain at least one uppercase letter and one number",
                }}}
        />
        {errors.password && 
        <span style={{color: 'red'}}>
          {errors.password.type === 'pattern' && 'Password is wrong'}
          {errors.password.type === 'required' && "*Password* is mandatory"}
        </span>}
        <button
          type="submit"
          className="w-full py-3 px-4 !bg-violet-800 hover:!bg-violet-900 text-white font-semibold rounded-xl shadow-lg transition-colors">
          Login
        </button> 
        <AuthNav isLoginMode = {true} title="Login"/>
      </form>
    </MainLayout>
  )
}









/* The difference between importing as a type or importing as a functions, constants, components 
  When you write import type you are telling typescript that this import is only when used for types, not for values at runtime
  This import completely disappears after compilation. No JS code is generated for it.
*/

/* export const Login: React.FC<IFormInput>  = () =>{
  Writing the above line tell typescript that Login is a component which expects props matching IFormInput. But inside your function you're not accepting
  any props at all.

  const {register, handleSubmit} = useForm<IFormInput>
  In this line <IFormInput> generic links your form's input fields to TypeScript types.Now when you use register("Email"), TS knows "Email" must be a key of
  IFormInput. If you type something wrong like register("Username"), you'll get a compile-time error.

  handleSubmit - It is a wrapper for onSubmit function. It run validation rules first. Only calls your onSubmit if everything passes.

*/
