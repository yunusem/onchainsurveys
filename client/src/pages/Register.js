import React, { useState } from "react";
import { registerUser } from "../api";
import Logo from "../assets/images/casper-logo.svg";
import { Link } from "react-router-dom";

function Register() {
  const [name, setName] = useState(""); // Add this line
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await registerUser({ name, email, password }); // Update this line
      console.log(response);
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  return (
    <div className="bg-gray-700 h-screen w-screen text-white flex items-center flex flex-col  justify-center ">
      <Link to="/">
        <img src={Logo} alt="logo" width="72px" />
      </Link>
      <h2 className="text-2xl font-semibold my-4">Register</h2>
      <form onSubmit={handleSubmit} className="w-72">
        <div className="flex flex-col">
          <label htmlFor="name" className="font-medium">
            Name {/* Add this label */}
          </label>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="p-2 h-11 rounded-lg mt-1 text-black font-medium outline-none"
          />
        </div>
        <div className="flex flex-col mt-3">
          <label className="font-medium" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            placeholder="E-mail address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-2 h-11 rounded-lg mt-1 text-black font-medium outline-none"
          />
        </div>

        <div className="flex flex-col mt-3">
          <label className="font-medium" htmlFor="password">
            Password
          </label>

          <input
            type="password"
            value={password}
            placeholder="Password"
            onChange={(e) => setPassword(e.target.value)}
            className="p-2 h-11 rounded-lg mt-1 text-black font-medium outline-none"
          />
        </div>

        <br />
        <button type="submit"           className="bg-red-500  py-3 rounded-xl font-semibold px-5 text-white w-72"
>Register</button>
      </form>

      <p className="mt-2 font-medium text-sm">
        Do you have account?
        <Link to="/login">
          <span className="text-red-500 font-semibold"> Login</span>
        </Link>
      </p>
    </div>
  );
}

export default Register;
