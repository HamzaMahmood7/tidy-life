import React, { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import Select from "react-select";
import { API_URL } from "../../config/config";
import { Edit3, XCircle } from "lucide-react";
import toast from "react-hot-toast";

const UpdateTaskPage = () => {
  const { taskId } = useParams();
  const [searchParams] = useSearchParams();
  const fromGroupId = searchParams.get("fromGroup");
  const nav = useNavigate();

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
  const [isLoading, setIsLoading] = useState(true);

  const tokenForAuth = localStorage.getItem("authToken");

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

        setDueDate(
          taskResponse.data.dueDate
            ? taskResponse.data.dueDate.split("T")[0]
            : "",
        );

        setAssignedUserIds(
          taskResponse.data.assignedUserIds.map((currentUserId) => ({
            value: currentUserId._id,
            label: currentUserId.username,
          })),
        );

        setStatus({
          value: taskResponse.data.status,
          label: taskResponse.data.status,
        });
        setPriority({
          value: taskResponse.data.priority,
          label: taskResponse.data.priority,
        });

        setAssignedUserIds(
          taskResponse.data.assignedUserIds.map((u) => ({
            value: u._id,
            label: u.username,
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
        toast.error("Failed to load task data");
        setIsLoading(false);
      }
    };
    getData();
  }, [taskId, tokenForAuth]);

  const handleUpdateTask = async (e) => {
    e.preventDefault();

    const updatedTask = {
      title,
      description,
      status: status.value,
      priority: priority.value,
      dueDate: dueDate || null,
      // map over Ids to update in DB
      assignedUserIds: assignedUserIds.map((user) => {
        return user.value;
      }),
      assignedGroup: assignedGroup ? assignedGroup.value : null,
    };

    try {
      const res = await axios.patch(`${API_URL}/task/${taskId}`, updatedTask, {
        headers: { authorization: `Bearer ${tokenForAuth}` },
      });
      toast.success("Task updated!");
      console.log("task updated", res.data);

      if (fromGroupId) {
        nav(`/group/${fromGroupId}`);
      } else {
        nav("/task-list");
      }
    } catch (error) {
      console.error("Failed to update the task:", error);
      toast.error("Error updating task");
    }
  };

  const userOptions = allUsers.map((user) => ({
    value: user._id,
    label: user.username,
  }));
  const groupOptions = allGroups.map((group) => ({
    value: group._id,
    label: group.groupName,
  }));

  if (isLoading) return <p className="empty-msg">Loading task info...</p>;

  return (
    <div className="group-details-container">
      <h1 className="page-title">
        <Edit3 size={28} /> Edit Task
      </h1>

      <form onSubmit={handleUpdateTask} className="card shadow-sm">
        <div className="form-group">
          <label>Task Title</label>
          <input
            className="custom-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            className="custom-input"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add details..."
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
            isClearable
          />
        </div>

        <div className="dashboard-footer-actions">
          <button type="submit" className="btn-primary">
            Update Task
          </button>
          <button
            type="button"
            onClick={() =>
              fromGroupId ? nav(`/group/${fromGroupId}`) : nav("/task-list")
            }
            className="btn-secondary"
          >
            <XCircle size={18} /> Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateTaskPage;
