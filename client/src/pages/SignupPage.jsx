import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SignupPage = () => {

  const [username, setUsernameState] = useState('')
  const [email, setEmailState] = useState('')
  const [password, setPasswordState] = useState('')

  const nav = useNavigate()

 const handleSignup = async(e) => {
  e.preventDefault()

  try {
    const createdUser = await axios.post('http://localhost:5005/auth/signup', {
      username,
      email,
      password
    })
    console.log(createdUser.data)
    nav('/login')
  } catch (error) {
    console.log(error)
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
        <button>Sign Up</button>
      </form>
    </div>
  );
};

export default SignupPage;
