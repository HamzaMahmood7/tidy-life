import axios from "axios";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../../config/config";

const SignupPage = () => {

  const [username, setUsernameState] = useState('')
  const [email, setEmailState] = useState('')
  const [password, setPasswordState] = useState('')
  const [error, setError] = useState(null)

  const nav = useNavigate()

 const handleSignup = async(e) => {
  e.preventDefault()
  setError(null)

  try {
    const createdUser = await axios.post(`${API_URL}/auth/signup`, {
      username,
      email,
      password
    })
    console.log(createdUser.data)
    nav('/login')
  } catch (error) {
    console.log(error)
    setError(error.response.data.errorMessage)
  }
 }

  return (
    <div>
      <h3>Sign up here!</h3>
      <form onSubmit={handleSignup}>
        <label>
          Username:
          <input type="text" value={username} onChange={(e) => {setUsernameState(e.target.value)}} />
        </label>
        <label>
          Email:
          <input type="email" value={email} onChange={(e) => {setEmailState(e.target.value)}}/>
        </label>
        <label>
          Password:
          <input type="password" value={password} onChange={(e) => {setPasswordState(e.target.value)}}/>
        </label>
        {/* show error message if required */}
        {error && <p className="error">{error}</p>}
        <button>Sign Up</button>
        <p>Already a member?</p>
        <Link to={'/login'}>Login</Link>
      </form>
    </div>
  );
};

export default SignupPage;
