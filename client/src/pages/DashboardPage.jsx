import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import axios from "axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import ReactConfetti from "react-confetti";
import { API_URL } from "../../config/config";
import {
  ArrowRight,
  Calendar,
  LayoutDashboard,
  List,
  Plus,
  PlusCircle,
  Users,
} from "lucide-react";

const DashboardPage = () => {
  const { currentUser } = useContext(AuthContext);

  const [tasks, setTasks] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // react confetti state
  const [showConfetti, setShowConfetti] = useState(false);

  // Auth token
  const tokenForAuth = localStorage.getItem("authToken");

  useEffect(() => {
    if (!currentUser) return;

    const fetchTasks = async () => {
      try {
        const res = await axios.get(`${API_URL}/task/dashboard-tasks`, {
          headers: {
            authorization: `Bearer ${tokenForAuth}`,
          },
        });
        setTasks(res.data);
      } catch (error) {
        console.error("Failed to fetch tasks", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;

    const fetchGroups = async () => {
      try {
        const res = await axios.get(`${API_URL}/group/dashboard-groups`, {
          headers: {
            authorization: `Bearer ${tokenForAuth}`,
          },
        });
        setGroups(res.data);
      } catch (error) {
        console.error("Failed to fetch groups", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, [currentUser]);

  const handleToggleComplete = async (taskId, currentStatus) => {
    try {
      const isChecking = currentStatus !== "Completed";
      const newStatus = currentStatus === "Completed" ? "To-do" : "Completed";

      const completedTaskRes = await axios.patch(
        `${API_URL}/task/${taskId}`,
        { status: newStatus },
        { headers: { authorization: `Bearer ${tokenForAuth}` } },
      );

      const updatedTaskStatus = tasks.map((currentTask) => {
        if (currentTask._id === taskId) {
          return { ...currentTask, status: newStatus };
        } else {
          return currentTask;
        }
      });
      setTasks(updatedTaskStatus);

      if (isChecking) {
        setShowConfetti(true);
        setTimeout(() => {
          setShowConfetti(false);
        }, 5000);
      }
    } catch (error) {
      console.log("could not update status");
      toast.error('could not update task status')
    }
  };

  if (loading) {
    return <p>Loading tasks...</p>;
  }
  return (
    <>
      {showConfetti && (
        <ReactConfetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false} // It fires once and stops
          numberOfPieces={300}
          gravity={0.3}
        />
      )}
      <div>
        <h1 className="page-title">
          <LayoutDashboard size={28} /> Dashboard
        </h1>
        <h2 className="welcome-text">Hi {currentUser.username}</h2>

        <div className="section-header">
          <h3>
            <List size={20} /> Your Tasks
          </h3>
          <Link to={"/create-task"} className="add-btn">
            <Plus size={18} /> New Task
          </Link>
        </div>

        {tasks.length === 0 ? (
          <p>No tasks yet</p>
        ) : (
          <div className="card-grid">
            {tasks.map((oneTask) => {
              const isDone = oneTask.status === "Completed";
              return (
                <div key={oneTask._id} className="card">
                  <div className="task-header">
                    <h4 className={isDone ? "status-Completed" : ""}>
                      {oneTask.title}
                    </h4>
                    <span
                      className={`priority-tag priority-${oneTask.priority}`}
                    >
                      {oneTask.priority}
                    </span>
                  </div>
                  <p style={{ fontSize: "0.9rem", color: "#666" }}>
                    {oneTask.description}
                  </p>
                  {oneTask.dueDate && (
                    <p className="task-date">
                      <Calendar size={14} />
                      Due: {new Date(oneTask.dueDate).toLocaleDateString()}
                    </p>
                  )}

                  <div className="card-actions">
                    Completed
                    <input
                      type="checkbox"
                      className="custom-checkbox"
                      checked={isDone}
                      onChange={() =>
                        handleToggleComplete(oneTask._id, oneTask.status)
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div className="dashboard-footer-actions">
          <Link to={"/task-list"} className="btn-secondary">
            <List size={18} /> View All Tasks
          </Link>
          <Link to={"/create-task"} className="btn-primary">
            <PlusCircle size={18} /> Create Task
          </Link>
        </div>

        {groups.length === 0 ? (
          <p>No groups yet</p>
        ) : (
          <div className="card-grid">
            {groups.map((oneGroup) => {
              const isOwner = oneGroup.createdBy?._id?.toString() === currentUser._id?.toString(); // checks if current user is the owner

              const myMemberEntry = oneGroup.members.find((oneMember) => {
                return oneMember.userId?._id?.toString() === currentUser._id?.toString();
              });
              const myRole = isOwner
                ? "Owner"
                : myMemberEntry?.role || "Member";
              return (
                <div key={oneGroup._id} className="card group-card">
                  <div className="task-header">
                    <h4>{oneGroup.groupName}</h4>
                    <span className="priority-tag priority-Low">{myRole}</span>
                  </div>

                  <div className="group-stats">
                    <p>
                      <Users size={14} /> {oneGroup.members.length} Members
                    </p>
                    <p>
                      <List size={14} /> {oneGroup.tasks.length} Tasks
                    </p>
                  </div>

                  <p className="created-by">
                    By: {oneGroup.createdBy?.username}
                  </p>

                  <Link to={`/group-list`} className="view-link">
                    View Members & Tasks <ArrowRight size={14} />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
        <div className="dashboard-footer-actions">
          <Link to={"/group-list"} className="btn-secondary">
            <Users size={18} /> View All Groups
          </Link>
          <Link to={"/create-group"} className="btn-primary">
            <PlusCircle size={18} /> Create Group
          </Link>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
