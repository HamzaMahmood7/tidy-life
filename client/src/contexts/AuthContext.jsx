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
              authorisation: `Bearer ${tokenInStorage}`,
            },
          },
        );

        console.log(loggedInUser.data)
        setCurrentUser(loggedInUser.data.decodedToken._id)
        setIsLoading(false)
        setIsLoggedIn(true)
      } else {
        setCurrentUser(null);
        setIsLoading(false);
        setIsLoggedIn(false);
        nav("/");
      }
    } catch (error) {
      setCurrentUser(null);
      setIsLoading(false);
      setIsLoggedIn(false);
      nav("/login");
      console.log(error);
    }
  }

  useEffect(() => {
    authenticateUser()
  }, [])

  return (
    <AuthContext.Provider value={{ currentUser, isLoading, isLoggedIn}}>
      {children}
    </AuthContext.Provider>
  );
};
export { AuthContext, AuthWrapper };
