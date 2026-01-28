import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import axios from "axios";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import ReactConfetti from "react-confetti";
import { API_URL } from "../../config/config";

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
        const res = await axios.get(
          `${API_URL}/task/dashboard-tasks`,
          {
            headers: {
              authorization: `Bearer ${tokenForAuth}`,
            },
          },
        );
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
        const res = await axios.get(`${API_URL}/group/all-groups`, {
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
      // toast.error('could not update task status')
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
        <h1>Dashboard</h1>
        <h2>Hi {currentUser.username}</h2>

        <h3>Your Data</h3>

        {tasks.length === 0 ? (
          <p>No tasks yet</p>
        ) : (
          <ul>
            {tasks.map((oneTask) => {
              const isDone = oneTask.status === "Completed";
              return (
                <li key={oneTask._id}>
                  <strong>{oneTask.title}</strong>
                  <p>{oneTask.description}</p>
                  <p>{oneTask.status}</p>
                  <span>{oneTask.priority}</span>
                  <input
                    type="checkbox"
                    checked={isDone}
                    onChange={() => {
                      handleToggleComplete(oneTask._id, oneTask.status);
                    }}
                  />
                </li>
              );
            })}
          </ul>
        )}
        <Link to={"/task-list"}>All tasks</Link>
        <Link to={"/create-task"}>Create a task</Link>

        {groups.length === 0 ? (
          <p>No groups yet</p>
        ) : (
          <ul>
            {groups.map((oneGroup) => {
              const isOwner = oneGroup.createdBy?._id === currentUser._id; // checks if current user is the owner

              const myMemberEntry = oneGroup.members.find((oneMember) => {
                return oneMember.userId?._id === currentUser._id;
              });
              const myRole =
                myMemberEntry?.role || (isOwner ? "owner" : "member");
              return (
                <li key={oneGroup._id}>
                  <strong>{oneGroup.groupName}</strong>
                  <span> {myRole}</span>
                  <p>Members: {oneGroup.members.length}</p>
                  <ul>
                    {oneGroup.members.map((oneMember) => {
                      return (
                        <li key={oneMember.userId?._id}>
                          {oneMember.userId?.username}{" "}
                          <small>{oneMember.role}</small>
                        </li>
                      );
                    })}
                  </ul>
                  <p>Group Tasks: {oneGroup.tasks.length}</p>
                  {oneGroup.tasks && oneGroup.tasks.length > 0 ? (
                    <ul>
                      {oneGroup.tasks.map((oneTask) => {
                        return (
                          <li key={oneTask._id}>
                            {oneTask.title} -<small>{oneTask.status}</small>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p>No tasks for this group yet.</p>
                  )}
                  <p>Created by: {oneGroup.createdBy?.username}</p>
                </li>
              );
            })}
          </ul>
        )}
        <Link to={"/group-list"}>All groups</Link>
        <Link to={"/create-group"}>Create a group</Link>
      </div>
    </>
  );
};

export default DashboardPage;
