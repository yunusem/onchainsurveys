import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/images/casper-logo.svg";
function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
    } else {
      setIsAuthenticated(false);
    }
  }, []);

  return (
    <div className="bg-gray-700 text-center h-screen w-screen text-white flex items-center flex flex-col  justify-center ">
      <img src={Logo} alt="logo" width="72px" />
      <h1 className="text-2xl font-semibold mt-4">
        Welcome to Onchain Surveys
      </h1>
      <br></br>
      {isAuthenticated ? (
        <div>
          <h2>You are logged in!</h2>
          <ul>
            <li>
              <Link to="/surveys/new">Create Survey</Link>
            </li>
            <li>
              <Link to="/surveys">My Surveys</Link>
            </li>
          </ul>
        </div>
      ) : (
        <div>
          <h2 className="mb-4 font-semibold">You aren't logged in.</h2>
          <ul className="flex items-center">
            <li>
              <Link to="/login">
                <button className="mr-4 bg-transparent border border-white  py-3 rounded-xl font-semibold px-10 text-white">
                  Login
                </button>
              </Link>
            </li>
            <li>
              <Link to="/register">
                <button className="bg-white py-3 rounded-xl font-semibold px-8 text-black">
                  Register
                </button>
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}

export default Home;
