import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";

const UserProfilePage = () => {
  const { currentUser } = useContext(AuthContext);
  console.log(currentUser);
  return (
    <div>
      <h1>Welcome {currentUser.username}</h1>
    </div>
  );
};

export default UserProfilePage;
