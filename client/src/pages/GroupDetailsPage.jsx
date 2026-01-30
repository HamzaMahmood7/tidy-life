import React, { useEffect, useState, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import axios from "axios";
import { API_URL } from "../../config/config";
import {
  Users,
  List,
  Plus,
  ChevronLeft,
  Shield,
  CheckCircle,
  Clock,
  Edit3,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

const GroupDetailsPage = () => {
  const { groupId } = useParams();
  const { currentUser } = useContext(AuthContext);
  const nav = useNavigate();

  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroupDetails = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const res = await axios.get(`${API_URL}/group/${groupId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setGroup(res.data);
      } catch (err) {
        console.error("Error fetching group", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGroupDetails();
  }, [groupId]);

  // Handle group deletion
  const handleDeleteGroup = async () => {
  const confirmFirst = window.confirm("Are you sure you want to delete this group?");
  if (!confirmFirst) return;
  
  const confirmSecond = window.confirm("This will also delete all tasks associated with this group. Proceed?");
  if (!confirmSecond) return;

  const loadingToast = toast.loading("Deleting group...");
  try {
    const token = localStorage.getItem("authToken");
    await axios.delete(`${API_URL}/group/${groupId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    toast.success("Group deleted successfully", { id: loadingToast });
    nav("/dashboard"); 
  } catch (error) {
    console.error("Error deleting group:", error);
    toast.error("Failed to delete group", { id: loadingToast });
  }
};

  // Handle task deletion
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    const loadingToast = toast.loading("Deleting task...");
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`${API_URL}/task/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setGroup({
        ...group,
        tasks: group.tasks.filter((t) => t._id !== taskId),
      });

      toast.success("Task deleted successfully", { id: loadingToast });
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete task", { id: loadingToast });
    }
  };

  if (loading) return <p className="empty-msg">Loading group details...</p>;
  if (!group) return <p className="empty-msg">Group not found.</p>;

  const isOwner =
    String(group.createdBy?._id || group.createdBy) ===
    String(currentUser?._id);

  return (
    <div className="group-details-container">
      <button
        onClick={() => nav(-1)}
        className="add-btn"
        style={{ marginBottom: "20px" }}
      >
        <ChevronLeft size={18} /> Back
      </button>

      <div
        className="card"
        style={{ marginBottom: "30px", borderLeft: "5px solid #ffa500" }}
      >
        <div className="task-header">
          <div className="title-group">
            <h1 style={{ margin: 0 }}>{group.groupName}</h1>
            <p className="created-by">
              Created by: <strong>{group.createdBy?.username}</strong>
            </p>
          </div>
        </div>
        <div className="group-actions-wrapper">
          {isOwner && (
            <>
              <Link
                to={`/update-group/${groupId}`}
                className="btn-secondary btn-edit-group"
                
              >
                <Edit3 size={14} /> Edit Group
              </Link>

              <button
                onClick={handleDeleteGroup}
                className="icon-btn delete btn-delete-group"
                title="Delete Group"
              >
                <Trash2 size={16} />
              </button>

              <span className="role-badge role-Owner">
                <Shield size={12} /> Owner
              </span>
            </>
          )}
        </div>
      </div>

      <div className="section-header">
        <h3>
          <List size={20} /> Group Tasks
        </h3>
        {isOwner && (
          <Link to={`/create-task?groupId=${groupId}`} className="btn-primary">
            <Plus size={18} /> Add Group Task
          </Link>
        )}
      </div>

      <div className="card-grid">
        {group.tasks?.length > 0 ? (
          group.tasks.map((task) => (
            <div key={task._id} className="card">
              <div className="task-header">
                <h4>{task.title}</h4>
                <span className={`priority-tag priority-${task.priority}`}>
                  {task.priority}
                </span>
              </div>
              <p className="card-description">{task.description}</p>
              {isOwner && (
                <div
                  className="card-actions"
                  style={{ display: "flex", gap: "8px" }}
                >
                  <Link
                    to={`/update-task/${task._id}?fromGroup=${groupId}`}
                    className="icon-btn edit"
                  >
                    <Edit3 size={18} />
                  </Link>
                  <button
                    onClick={() => handleDeleteTask(task._id)}
                    className="icon-btn delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
              <div className="task-date">
                {task.status === "Completed" ? (
                  <CheckCircle size={14} color="green" />
                ) : (
                  <Clock size={14} />
                )}
                <span>Status: {task.status}</span>
              </div>
            </div>
          ))
        ) : (
          <p className="empty-msg">No tasks assigned to this group yet.</p>
        )}
      </div>

      <div className="section-header" style={{ marginTop: "40px" }}>
        <h3>
          <Users size={20} /> Members ({group.members.length})
        </h3>
      </div>

      <div className="member-grid">
        {group.members.map((member) => (
          <div key={member.userId?._id} className="member-card">
            <div className="task-header" style={{ marginBottom: 0 }}>
              <strong style={{ fontSize: "0.9rem" }}>
                {member.userId?.username}
              </strong>
              <small
                className="role-badge role-Member"
                style={{ fontSize: "0.65rem" }}
              >
                {member.role}
              </small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GroupDetailsPage;
