import MainLayout from "../Layout/MainLayout"
import { useForm} from "react-hook-form";
import {Input} from '../props/FormProps'
import type{SubmitHandler} from "react-hook-form";
import type {IFormInput} from '../props/FormProps'
import { AuthNav } from "../components/AuthNavigation";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "http://127.0.0.1:8080"

export const SignUp = () => {
    const {register, handleSubmit, formState: {errors}} = useForm<IFormInput>( {defaultValues : {
    first_name: "",
    last_name: "",
    email: "",
    password: ""
  }})
    const navigate = useNavigate()

    const [message, setMessage] = useState<{type: "success" | "error"; text: string} | null>(null); 
    
    const onSubmit: SubmitHandler<IFormInput> = async (data) => {
        console.log("Form data:", data);
        try {
            const res = await fetch(`${API_BASE}/signup`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data), 
            });

            const result = await res.json();
            console.log(result)

            if (!res.ok) { 
            setMessage({type: "error", text:"Email is already registered!"});
            return;
            }
            else{
                setMessage({type: "success", text:"User Registered Successfully!"});
                navigate('/login')
            }
        } catch (error) {
            setMessage({type: "error", text:"Something went wrong. Please try again later!"});
        }
        };

    return(
        <MainLayout title="SignUp">
            {message && (<p className={`mb-4 ${message.type === "error" ? "text-red-500" : "text-green-500"}`}>{message.text}</p>)}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input type = "text" placeholder = "First Name" label="first_name"   register={register} rules={{required: true}}/>
                <Input type = "text" placeholder = "Last Name" label="last_name" register={register} rules={{required: true}}/>
                <Input type = "email" placeholder = "Email" label="email" register={register} rules={{required: true}}/>
                {errors.email && <span style={{color: 'red'}}>*Email* is mandatory</span>}
                <Input type = "password" placeholder = "Password" label="password" register={register} rules={{required:true, pattern: {
                        value: /^(?=.*[A-Z])(?=.*\d).+$/,
                        message: "Must contain at least one uppercase letter and one number",
                        }}}
                />
                {errors.password && 
                <span style={{color: 'red'}}>
                {errors.password.type === 'required' && "*Password* is mandatory"}
                {errors.password.type === 'pattern' && errors.password.message}
                </span>}
                <button
                type="submit"
                className="w-full py-3 px-4 !bg-violet-600 hover:!bg-violet-700 text-white font-semibold rounded-xl shadow-lg transition-colors">
                Sign Up
                </button> 
                <AuthNav isLoginMode={false} title="Login"/>
            </form>
        </MainLayout>
    )
}