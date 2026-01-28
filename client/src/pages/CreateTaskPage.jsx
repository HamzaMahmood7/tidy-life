import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

const CreateTaskPage = () => {
    const nav = useNavigate()

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("To-do");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
  const [assignedUserIds, setAssignedUserIds] = useState([]);
  const [assignedGroup, setAssignedGroup] = useState(null);

  const [allUsers, setAllUsers] = useState([]);
  const [allGroups, setAllGroups] = useState([]);

  const tokenForAuth = localStorage.getItem("authToken");

  // useEffect to fetch all users and groups from the backend
  useEffect(() => {
    const fetchUsersAndGroups = async () => {
      try {
        const [usersRes, groupsRes] = await Promise.all([
          axios.get("http://localhost:5005/user/all-users", {
            headers: { authorization: `Bearer ${tokenForAuth}` },
          }),
          axios.get("http://localhost:5005/group/all-groups", {
            headers: { authorization: `Bearer ${tokenForAuth}` },
          }),
        ]);

        console.log("Users fetched:", usersRes.data);
        console.log("Groups fetched:", groupsRes.data);
        setAllUsers(usersRes.data);
        setAllGroups(groupsRes.data);
      } catch (error) {
        console.error("Failed to fetch users or groups: ", error);
      }
    };

    fetchUsersAndGroups();
  }, [tokenForAuth]);

   // React Select options
  const userOptions = allUsers.map((user) => ({
    value: user._id,
    label: user.username,
  }));

  const groupOptions = allGroups.map((group) => ({
    value: group._id,
    label: group.groupName,
  }));

//   const handleUserSelection = (e) => {
//     const value = Array.from(
//       e.target.selectedOptions,
//       (option) => option.value,
//     );
//     setAssignedUserIds(value);
//   };

  const handleAddTask = async (e) => {
    e.preventDefault();

    const newTask = {
      title,
      description,
      status,
      priority,
      dueDate: dueDate || null,
      //   assignedUserIds: assignedUserIds || [],
      //   assignedGroup: assignedGroup,
      assignedUserIds: assignedUserIds.map((users) => users.value), // array of IDs
      assignedGroup: assignedGroup ? assignedGroup.value : null,
    };

    try {
      const res = await axios.post(
        "http://localhost:5005/task/create-task",
        newTask,
        {
          headers: {
            authorization: `Bearer ${tokenForAuth}`,
          },
        },
      );
      console.log("Task was successfully created!", res.data);
      alert(`task created ${res.data.title}`)
    } catch (error) {
      console.log("failed to create task: ", error);
    }
  };

  return (
    <>
      <div>Create Task</div>
      <form onSubmit={handleAddTask}>
        <label>
          Task Title
          <input
            name="TaskTitle"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
            }}
            required
            type="text"
            placeholder="Task Title"
          ></input>
        </label>
        <label>
          Description
          <textarea
            name="TaskDescription"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
            }}
            type="text"
            placeholder="Task Description"
          ></textarea>
        </label>
        <label>
          Status
          <select
            name="TaskStatus"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
            }}
            placeholder="Task Status"
          >
            <option value="To-do">To-do</option>
            <option value="In-progress">In-progress</option>
            <option value="Completed">Completed</option>
          </select>
        </label>
        <label>
          Priority
          <select
            name="TaskPriority"
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value);
            }}
            placeholder="Task Priority"
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </label>
        <label>
          Due Date
          <input
            name="TaskDueDate"
            value={dueDate}
            onChange={(e) => {
              setDueDate(e.target.value);
            }}
            type="date"
            placeholder="Task Title"
          ></input>
        </label>
        <label>
          Assign Users
          <Select
            isMulti
            options={userOptions}
            value={assignedUserIds}
            onChange={setAssignedUserIds}
            placeholder="Select users..."
          />
        </label>

        <label>
          Assign Group
          <Select
            options={groupOptions}
            value={assignedGroup}
            onChange={setAssignedGroup}
            placeholder="Select group..."
            isClearable
          />
        </label>
        {/* <label>
          Assign Users
          <select
            multiple
            value={assignedUserIds}
            onChange={handleUserSelection}
          >
            {allUsers.map((user) => (
              <option key={user._id} value={user._id}>
                {user.username}
              </option>
            ))}
          </select>
        </label>

        <label>
          Assign Group
          <select
            value={assignedGroup || ""}
            onChange={(e) => setAssignedGroup(e.target.value || null)}
          >
            <option value="">No group</option>
            {allGroups.map((group) => (
              <option key={group._id} value={group._id}>
                {group.groupName}
              </option>
            ))}
          </select>
        </label> */}
        <button type="submit">Create Task</button>
        <button type="button" onClick={() => {nav('/dashboard')}}>Cancel</button>
      </form>
    </>
  );
};

export default CreateTaskPage;
