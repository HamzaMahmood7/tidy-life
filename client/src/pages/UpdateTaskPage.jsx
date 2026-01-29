import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Select from "react-select";
import { API_URL } from "../../config/config";

const UpdateTaskPage = () => {
  const { taskId } = useParams();
  const nav = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("To-do");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
  const [assignedUserIds, setAssignedUserIds] = useState([]);
  const [assignedGroup, setAssignedGroup] = useState(null);

  const [allUsers, setAllUsers] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const tokenForAuth = localStorage.getItem("authToken");

  useEffect(() => {
    if (!taskId) {
      console.error("No task ID found in the URL");
      return;
    }

    const getData = async () => {
      try {
        const headers = { authorization: `Bearer ${tokenForAuth}` };

        const [usersResponse, groupsResponse, taskResponse] = await Promise.all(
          [
            axios.get(`${API_URL}/user/all-users`, { headers }),
            axios.get(`${API_URL}/group/all-groups`, { headers }),
            axios.get(`${API_URL}/task/${taskId}`, { headers }),
          ],
        );

        setAllUsers(usersResponse.data);
        setAllGroups(groupsResponse.data);

        setTitle(taskResponse.data.title);
        setDescription(taskResponse.data.description);
        setStatus(taskResponse.data.status);
        setPriority(taskResponse.data.priority);
        
        setDueDate(taskResponse.data.dueDate ? taskResponse.data.dueDate.split("T")[0] : "");

        setAssignedUserIds(
          taskResponse.data.assignedUserIds.map((currentUserId) => ({
            value: currentUserId._id,
            label: currentUserId.username,
          })),
        );

        if (taskResponse.data.assignedGroup) {
          setAssignedGroup({
            value: taskResponse.data.assignedGroup._id,
            label: taskResponse.data.assignedGroup.groupName,
          });
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setIsLoading(false);
      }
    };
    getData();
  }, [taskId, tokenForAuth]);

  const userOptions = allUsers.map((user) => ({
    value: user._id,
    label: user.username,
  }));
  const groupOptions = allGroups.map((group) => ({
    value: group._id,
    label: group.groupName,
  }));

  const handleUpdateTask = async (e) => {
    e.preventDefault();

    const updatedTask = {
      title,
      description,
      status,
      priority,
      dueDate: dueDate || null,
      // map over Ids to update in DB
      assignedUserIds: assignedUserIds.map((user) => {
        return user.value;
      }),
      assignedGroup: assignedGroup ? assignedGroup.value : null,
    };

    try {
      const res = await axios.patch(
        `${API_URL}/task/${taskId}`,
        updatedTask,
        {
          headers: { authorization: `Bearer ${tokenForAuth}` },
        },
      );
      nav("/task-list");
    } catch (error) {
      console.error("Failed to update the task:", error);
    }
  };

  if (isLoading) return <p>Loading task info...</p>;

  return (
    <>
      <div>UpdateTaskPage</div>
      <h2> Edit Task</h2>
      <form onSubmit={handleUpdateTask}>
        <label>
          Title
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          ></input>
        </label>
        <label>
          Description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
        <label>Assign Users</label>
        <Select
          isMulti
          options={userOptions}
          value={assignedUserIds}
          onChange={setAssignedUserIds}
        />

        <label>Assign Group</label>
        <Select
          isClearable
          options={groupOptions}
          value={assignedGroup}
          onChange={setAssignedGroup}
        />
        <button type="submit">Update Task</button>
        <button
          type="button"
          onClick={() => {
            nav("/task-list");
          }}
        >
          Cancel
        </button>
      </form>
    </>
  );
};

export default UpdateTaskPage;
