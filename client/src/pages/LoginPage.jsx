import axios from "axios";
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";

const LoginPage = () => {
  const [email, setEmailState] = useState("");
  const [password, setPasswordState] = useState("");
  const [error, setError] = useState(null);

  const nav = useNavigate();
  const {authenticateUser} = useContext(AuthContext)

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null)

    const userToLogin = {
      email,
      password
    }

    try {
      const createdUser = await axios.post("http://localhost:5005/auth/login", userToLogin);
      console.log(createdUser.data);
      // Store the auth token in local storage
      localStorage.setItem("authToken", createdUser.data.authToken);
      await authenticateUser()
      nav("/dashboard");
    } catch (error) {
      console.log(error);
      setError(error.response.data.errorMessage);
    }
  };

  return (
    <div>
      <h3>Login here!</h3>
      <form onSubmit={handleLogin}>
        <label>
          Email:
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmailState(e.target.value);
            }}
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPasswordState(e.target.value);
            }}
          />
        </label>
        {/* show error message if required */}
        {error && <p className="error">{error}</p>}
        <button>Login</button>
        <p>Don't have an account yet?</p>
        <Link to={'/signup'}>Sign up here!</Link>
      </form>
    </div>
  );
};

export default LoginPage;
