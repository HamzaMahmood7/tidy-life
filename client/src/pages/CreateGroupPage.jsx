import axios from "axios";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../../config/config";

const CreateGroupPage = () => {
  const [groupName, setGroupName] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const nav = useNavigate();

  // search for users while typing
  const handleSearch = async (e) => {
    setQuery(e.target.value);
    if (e.target.value.length < 2) return setResults([]);

    try {
      const tokenForAuth = localStorage.getItem("authToken");
      const searchRes = await axios.get(
        `${API_URL}/user/search?username=${e.target.value}`,
        {
          headers: { authorization: `Bearer ${tokenForAuth}` },
        },
      );
      console.log("searching users", searchRes.data);
      setResults(searchRes.data);
    } catch (error) {
      console.error("Error searching users", error);
    }
  };

  // add a user to the selectedUsers state
  const addUser = (user) => {
    // don't allow duplicate users
    if (
      !selectedUsers.find((currentUser) => {
        return currentUser._id === user._id;
      })
    ) {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();

    try {
      //need to match the selectedUsers list to Schema
      const membersList = selectedUsers.map((eachSelectedUser) => ({
        userId: eachSelectedUser._id,
      }));
      const tokenForAuth = localStorage.getItem("authToken");

      const createdGroupRes = await axios.post(
        `${API_URL}/group/create-group`,
        { groupName, members: membersList },
        { headers: { authorization: `Bearer ${tokenForAuth}` } },
      );
      console.log("created group!", createdGroupRes);
      nav("/dashboard");
    } catch (error) {
      console.error("Could not create group", error);
    }
  };

  return (
    <>
      <div></div>
      <h2>Create a group</h2>
      <form onSubmit={handleCreateGroup}>
        <input
          placeholder="Group Name"
          value={groupName}
          onChange={(e) => {
            setGroupName(e.target.value);
          }}
          required
        />
        <div>
          <input
            placeholder="Search usernames..."
            value={query}
            onChange={handleSearch}
          />
          {results.map((hoveredUser) => {
            return (
              <div
                key={hoveredUser._id}
                onClick={() => {
                  addUser(hoveredUser);
                }}
              >
                {hoveredUser.username} (+)
              </div>
            );
          })}
        </div>
        <div>
          <h4>Selected Members:</h4>
          {selectedUsers.map((addedUser) => {
            return <span key={addedUser._id}>{addedUser.username}</span>;
          })}
        </div>
        <button type="submit">Create Group</button>
      </form>
    </>
  );
};

export default CreateGroupPage;
