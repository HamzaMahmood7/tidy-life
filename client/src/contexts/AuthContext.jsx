import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

const AuthWrapper = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const nav = useNavigate();

  //function to authenticate user via the authToken
  async function authenticateUser() {
    const tokenInStorage = localStorage.getItem("authToken");
    try {
      if (tokenInStorage) {
        const loggedInUser = await axios.get(
          "http://localhost:5005/auth/verify",
          {
            headers: {
              authorization: `Bearer ${tokenInStorage}`,
            },
          },
        );

        console.log(loggedInUser.data)
        setCurrentUser(loggedInUser.data.currentLoggedInUser)
        setIsLoading(false)
        setIsLoggedIn(true)
      } else {
        setCurrentUser(null);
        setIsLoading(false);
        setIsLoggedIn(false);
        // nav("/"); // removed as it is in the protected route component
      }
    } catch (error) {
      setCurrentUser(null);
      setIsLoading(false);
      setIsLoggedIn(false);
      nav("/login");
      console.log(error);
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken');
  }


  useEffect(() => {
    authenticateUser()
  }, [])

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, isLoggedIn, authenticateUser, handleLogout}}>
      {children}
    </AuthContext.Provider>
  );
};
export { AuthContext, AuthWrapper };
