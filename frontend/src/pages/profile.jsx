import { useEffect, useState } from "react";
import LoginService from "../services/LoginService";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await LoginService.getUsername();
        // adjust this if API returns { username: "..." }
        setName(response.data);
      } catch (error) {
        console.error("Failed to fetch username:", error);
      }
    };

    fetchUsername();
  }, []);

  const handleClick = () => {
    navigate("/aimentor");
  };

  return (
    <>
      <div>Username is {name}</div>
      <button onClick={handleClick}>go to the ai</button>
    </>
  );
};

export default Profile;
