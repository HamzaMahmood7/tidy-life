import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Select from "react-select";
import { API_URL } from "../../config/config";
import { PlusCircle, XCircle, LayoutDashboard } from "lucide-react";
import toast from "react-hot-toast";

const CreateTaskPage = () => {
  const nav = useNavigate();

  const [searchParams] = useSearchParams();
  const preSelectedGroupId = searchParams.get("groupId");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState({ value: "To-do", label: "To-do" });
  const [priority, setPriority] = useState({
    value: "Medium",
    label: "Medium",
  });
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
          axios.get(`${API_URL}/user/all-users`, {
            headers: { authorization: `Bearer ${tokenForAuth}` },
          }),
          axios.get(`${API_URL}/group/all-groups`, {
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

  useEffect(() => {
    if (preSelectedGroupId && allGroups.length > 0) {
      const foundGroup = allGroups.find((g) => g._id === preSelectedGroupId);
      if (foundGroup) {
        setAssignedGroup({
          value: foundGroup._id,
          label: foundGroup.groupName,
        });
      }
    }
  }, [preSelectedGroupId, allGroups]);

  // This runs whenever assignedGroup changes
  useEffect(() => {
    if (assignedGroup && allGroups.length > 0) {
      // Find the full group object to get the members array
      const targetGroup = allGroups.find((g) => g._id === assignedGroup.value);

      if (targetGroup && targetGroup.members) {
        const membersToAssign = targetGroup.members.map((m) => ({
          value: m.userId?._id || m.userId,
          label: m.userId?.username || "Member",
        }));

        setAssignedUserIds(membersToAssign);
      }
    } else if (!assignedGroup) {
      setAssignedUserIds([]);
    }
  }, [assignedGroup, allGroups]);

  // React Select options
  const userOptions = allUsers.map((user) => ({
    value: user._id,
    label: user.username,
  }));

  const groupOptions = allGroups.map((group) => ({
    value: group._id,
    label: group.groupName,
  }));

  const statusOptions = [
    { value: "To-do", label: "To-do" },
    { value: "In-progress", label: "In-progress" },
    { value: "Completed", label: "Completed" },
  ];
  const priorityOptions = [
    { value: "Low", label: "Low" },
    { value: "Medium", label: "Medium" },
    { value: "High", label: "High" },
  ];

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
      status: status.value,
      priority: priority.value,
      dueDate: dueDate || null,
      //   assignedUserIds: assignedUserIds || [],
      //   assignedGroup: assignedGroup,
      assignedUserIds: assignedUserIds.map((users) => users.value), // array of IDs
      assignedGroup: assignedGroup ? assignedGroup.value : null,
    };

    try {
      const res = await axios.post(`${API_URL}/task/create-task`, newTask, {
        headers: {
          authorization: `Bearer ${tokenForAuth}`,
        },
      });
      toast.success("Task Created!");

      if (preSelectedGroupId) {
        // Send them back to the group they came from
        nav(`/group/${preSelectedGroupId}`);
      } else {
        // Otherwise, go to dashboard
        nav("/dashboard");
      }
    } catch (error) {
      console.log("failed to create task: ", error);
      toast.error("Failed to create task");
    }
  };

  return (
    <div className="group-details-container">
      <h1 className="page-title">
        <PlusCircle size={28} /> Create New Task
      </h1>

      <form onSubmit={handleAddTask} className="card shadow-sm">
        <div className="form-group">
          <label>Task Title</label>
          <input
            className="custom-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="What needs to be done?"
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            className="custom-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add some details..."
          />
        </div>

        <div className="grid-2-col">
          <div className="form-group">
            <label>Status</label>
            <Select
              options={statusOptions}
              value={status}
              onChange={setStatus}
            />
          </div>
          <div className="form-group">
            <label>Priority</label>
            <Select
              options={priorityOptions}
              value={priority}
              onChange={setPriority}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Due Date</label>
          <input
            type="date"
            className="custom-input"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Assign Users</label>
          <Select
            isMulti
            options={userOptions}
            value={assignedUserIds}
            onChange={setAssignedUserIds}
          />
        </div>

        <div className="form-group">
          <label>Assign Group</label>
          <Select
            options={groupOptions}
            value={assignedGroup}
            onChange={setAssignedGroup}
            placeholder="Select group..."
            isClearable={!preSelectedGroupId}
            isDisabled={!!preSelectedGroupId}
          />
          {preSelectedGroupId && (
            <small style={{ color: "#ffa500", marginTop: "4px" }}>
              Adding task specifically to this group
            </small>
          )}
        </div>

        <div className="dashboard-footer-actions">
          <button type="submit" className="btn-primary">
            <PlusCircle size={18} /> Create Task
          </button>
          <button
            type="button"
            onClick={() => nav("/dashboard")}
            className="btn-secondary"
          >
            <XCircle size={18} /> Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTaskPage;
