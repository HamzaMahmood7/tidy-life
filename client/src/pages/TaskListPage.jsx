import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { API_URL } from "../../config/config";

const TaskListPage = () => {
  const { currentUser } = useContext(AuthContext);
  const nav = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

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

        const deletedTaskRes = await axios.delete(
          `${API_URL}/task/${taskId}`,
          {
            headers: {
              authorization: `Bearer ${tokenForAuth}`,
            },
          },
        );

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

  if (loading) {
    return <p>Loading tasks...</p>;
  }

  return (
    <>
      <div>
        <h2>Hi {currentUser.username}</h2>

        <h3>Your tasks</h3>

        {tasks.length === 0 ? (
          <p>No tasks yet</p>
        ) : (
          <ul>
            {tasks.map((oneTask) => {
              return (
                <div key={oneTask._id}>
                  <li>
                    <strong>{oneTask.title}</strong>
                    <p>{oneTask.description}</p>
                    <p>{oneTask.status}</p>
                    <span>{oneTask.priority}</span>
                  </li>

                  <Link to={`/update-task/${oneTask._id}`}>Update Task</Link>
                  <button
                    onClick={() => {
                      handleDeleteTask(oneTask._id);
                    }}
                  >
                    Delete Task
                  </button>
                </div>
              );
            })}
          </ul>
        )}
        <button
          type="button"
          onClick={() => {
            nav("/dashboard");
          }}
        >
          Return to Dashboard
        </button>
      </div>
    </>
  );
};

export default TaskListPage;
