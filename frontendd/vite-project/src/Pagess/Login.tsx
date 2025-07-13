import React, { useState, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from './UserContext'; //  context file we'll create
import { toast } from 'react-toastify';
// Define the expected context type
interface UserContextType {
  setUser: (user: any) => void;
  // add other properties if needed
}

const Login = () => {
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext as React.Context<UserContextType>);

  const [formData, setFormData] = useState({
    name: '',
    password: '',
    role: 'user',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formData.name || !formData.password) {
    toast.error(" Please fill in all fields");
    return;
  }

  if (formData.role !== 'user' && formData.role !== 'admin') {
    toast.error(" Please select a valid role");
    return;
  }

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
      credentials: 'include',  //  very important for session to work
    });

    const data = await res.json();

    if (data.success) {
      setUser(data.user);   // Stored in context 
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success(" Login successful!");
      navigate('/');
    } else {
      toast.error(` ${data.message || 'Invalid credentials'}`);
    }
  } catch (err) {
    console.error(" Fetch error:", err);
    toast.error("Could not connect to server.");
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex flex-col items-center">
        <form
          className="bg-white shadow-lg rounded-lg p-8 w-full max-w-sm"
          onSubmit={handleSubmit}
        >
          <h1 className="text-2xl font-semibold text-center text-orange-500 mb-6">Welcome to Login Page</h1>

          <input
            name="name"
            type="text"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full mb-4 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            className="w-full mb-4 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
          />

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full mb-6 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-400"
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>

          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600 transition duration-200"
          >
            Submit
          </button>
        </form>

        <Link
          to="/"
          className="mt-4 bg-red-700 text-red-50 px-3 py-1 rounded inline-flex items-center"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
          Back
        </Link>
      </div>
    </div>
  );
};

export default Login;
