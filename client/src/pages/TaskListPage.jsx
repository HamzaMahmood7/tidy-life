import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { API_URL } from "../../config/config";
import { List, Plus, Trash2, Edit3, ChevronLeft, Calendar } from "lucide-react";
import ReactConfetti from "react-confetti";

const TaskListPage = () => {
  const { currentUser } = useContext(AuthContext);
  const nav = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (!currentUser) return;

    const fetchTasks = async () => {
      try {
        const tokenForAuth = localStorage.getItem("authToken");
        const res = await axios.get(`${API_URL}/task/all-tasks`, {
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

  const handleDeleteTask = async (taskId) => {
    const confirmedDeletePopup = window.confirm(
      "Are you sure you want to delete this task?",
    );

    if (confirmedDeletePopup) {
      const loadingToast = toast.loading("Deleting task...");

      try {
        const tokenForAuth = localStorage.getItem("authToken");

        const deletedTaskRes = await axios.delete(`${API_URL}/task/${taskId}`, {
          headers: {
            authorization: `Bearer ${tokenForAuth}`,
          },
        });

        const updatedTaskList = tasks.filter((currentTask) => {
          if (currentTask._id !== taskId) {
            return true;
          }
        });
        setTasks(updatedTaskList);

        toast.success(`Task "${deletedTaskRes.data.title}" was deleted`, {
          id: loadingToast,
        });
        console.log("task was deleted", deletedTaskRes);
      } catch (error) {
        console.error("Failed to delete task:", error);
        toast.error("Failed to delete the task", {
          id: loadingToast,
        });
      }
    }
  };

  const handleToggleComplete = async (taskId, currentStatus) => {
    try {
      const isChecking = currentStatus !== "Completed";
      const newStatus = currentStatus === "Completed" ? "To-do" : "Completed";
      const tokenForAuth = localStorage.getItem("authToken");

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
      toast.error("could not update task status");
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
          <List size={28} /> All Tasks
        </h1>

        <div className="section-header">
          <h3>Manage Your Work</h3>
          <Link to="/create-task" className="add-btn">
            <Plus size={18} /> New Task
          </Link>
        </div>

        {tasks.length === 0 ? (
          <p className="empty-msg">No tasks found. Start by creating one!</p>
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

                  <p className="card-description">{oneTask.description}</p>

                  {oneTask.dueDate && (
                    <p className="task-date">
                      <Calendar size={14} /> Due:{" "}
                      {new Date(oneTask.dueDate).toLocaleDateString()}
                    </p>
                  )}

                  <div className="card-actions">
                    <div className="status-toggle">
                      <span>Completed</span>
                      <input
                        type="checkbox"
                        className="custom-checkbox"
                        checked={isDone}
                        onChange={() =>
                          handleToggleComplete(oneTask._id, oneTask.status)
                        }
                      />
                    </div>
                    <Link
                      to={`/update-task/${oneTask._id}`}
                      className="icon-btn edit"
                    >
                      <Edit3 size={18} />
                    </Link>
                    <button
                      onClick={() => handleDeleteTask(oneTask._id)}
                      className="icon-btn delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="dashboard-footer-actions">
          <button onClick={() => nav("/dashboard")} className="btn-secondary">
            <ChevronLeft size={18} /> Back to Dashboard
          </button>
        </div>
      </div>
    </>
  );
};

export default TaskListPage;
