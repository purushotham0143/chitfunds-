// UserForm.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// npm install react-hook-form

/// This page is not  used in anywhere in the  website 

type FormData = {
  name: string;
  email: string;
  password: string;
};

const UserForm= () => {
  const { register, handleSubmit, formState: { errors }, reset,} = useForm<FormData>();

  const onSubmit = (data: FormData) => {
    console.log(" Submitted:", data);
    toast.success("User successfully registered!");
    reset();
  };

  return (
    <div style={{ maxWidth: 400, margin: "auto", padding: 20 }}>
      <h2>Register User</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Name */}
        <div>
          <label>Name</label>
          <input {...register("name", { required: "Name is required" })} placeholder="Enter your name"/>
          {errors.name && <p style={{ color: "red" }}>{errors.name.message}</p>}
        </div>

        {/* Email */}
        <div>
          <label>Email</label>
          <input {...register("email", {required: "Email is required",pattern: {value: /^\S+@\S+$/i, message: "Invalid email address", },})}placeholder="Enter your email"/>
          {errors.email && (<p style={{ color: "red" }}>{errors.email.message}</p>)}
        </div>

        {/* Password */}
        <div>
          <label>Password</label>
          <input type="password"{...register("password", {required: "Password is required",minLength: {value: 6,message: "Minimum 6 characters required", },})}placeholder="Enter your password"/>
          {errors.password && (
            <p style={{ color: "red" }}>{errors.password.message}</p>
          )}
        </div>

        <button type="submit" style={{ marginTop: 10 }}>
          Submit
        </button>
      </form>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default UserForm;
