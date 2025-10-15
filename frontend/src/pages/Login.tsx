import MainLayout from "../Layout/MainLayout";
import { useForm} from "react-hook-form";
import {Input} from '../props/FormProps'
import type{SubmitHandler} from "react-hook-form";
import type {IFormInput} from '../props/FormProps'
import { AuthNav } from "../components/AuthNavigation";
import { useNavigate } from "react-router-dom";
import { useContext, useEffect } from "react";
import { AuthContext } from "../utils/auth";



export const Login  = () =>{
  const navigate = useNavigate();
  const { register, handleSubmit, formState:{errors}} = useForm<IFormInput>({
    defaultValues:{email: "", password:""}
  });
  const authContext = useContext(AuthContext);

  const onSubmit: SubmitHandler<IFormInput> = async (data) => {
  try {
    console.log("🔄 Starting login process...");
    
    const res = await fetch("http://localhost:8080/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: data.email,
        password: data.password,
      }),
    });

    console.log(`📊 Login response status: ${res.status}`);
    
    const responseData = await res.json();
    console.log("📄 Login response data:", responseData);

    if (!res.ok) {
      console.error("❌ Login failed:", responseData.detail);
      alert(responseData.detail || "Invalid credentials");
      return;
    }

    console.log("✅ Login successful, storing token...");
    
    localStorage.setItem("access_token", responseData.access_token);
    
    authContext?.login(responseData.access_token);

    alert("Login Successful");

    console.log(`🎯 User role: ${responseData.role}, navigating...`);
    if (responseData.role === "admin") {
      navigate("/dashboard");
    } else {
      navigate("/posts");
    }
  } catch (error) {
    console.error("💥 Login error:", error);
    alert("Error while logging in");
  }
};
  // useEffect(() => {
  //   if(authContext?.user){
  //     if(authContext.user.role == "admin"){
  //       navigate("/dashboard")
  //     }else{
  //       navigate("/posts")
  //     }

  //   }
  // }, [authContext, navigate]);

  return(
    <MainLayout title="Login">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          type="email"
          placeholder="Email"
          label="email"
          register={register}
          rules={{ required: true }}
        />
        {errors.email && <span className="text-red-500">*Email* is mandatory</span>}

        <Input
          type="password"
          placeholder="Password"
          label="password"
          register={register}
          rules={{
            required: true,
            pattern: {
              value: /^(?=.*[A-Z])(?=.*\d).+$/,
              message: "Must contain at least one uppercase letter and one number",
            },
          }}
        />
        {errors.password && (
          <span className="text-red-500">
            {errors.password.type === "pattern" && "Password is wrong"}
            {errors.password.type === "required" && "*Password* is mandatory"}
          </span>
        )}

        <button
          type="submit"
          className="w-full py-3 px-4 bg-violet-800 hover:bg-violet-900 text-white font-semibold rounded-xl shadow-lg transition-colors"
        >
          Login
        </button>

        <AuthNav isLoginMode={true} title="Login" />
      </form>
    </MainLayout>
  )
}