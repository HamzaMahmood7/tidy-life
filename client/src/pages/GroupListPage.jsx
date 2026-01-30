import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../contexts/AuthContext";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "../../config/config";
    import { Users as UsersIcon, Plus, ChevronLeft, ArrowRight, Shield, List } from "lucide-react";


const GroupListPage = () => {
  const { currentUser } = useContext(AuthContext);
  const nav = useNavigate();

  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const fetchGroups = async () => {
      try {
        const tokenForAuth = localStorage.getItem("authToken");
        const res = await axios.get(`${API_URL}/group/all-groups`, {
          headers: {
            Authorization: `Bearer ${tokenForAuth}`,
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

  if (loading) {
    return <p>Loading tasks...</p>;
  }

  return (
    <div>
      <h1 className="page-title">
        <UsersIcon size={28} /> Your Groups
      </h1>

      <div className="section-header">
        <h3>Collaboration Hub</h3>
        <Link to="/create-group" className="add-btn">
          <Plus size={18} /> New Group
        </Link>
      </div>

      {groups.length === 0 ? (
        <p className="empty-msg">You aren't part of any groups yet.</p>
      ) : (
        <div className="card-grid">
          {groups.map((oneGroup) => {
            const isOwner =
              String(oneGroup.createdBy?._id || oneGroup.createdBy) ===
              String(currentUser?._id);
            const myMemberEntry = oneGroup.members.find(
              (m) =>
                String(m.userId?._id || m.userId) === String(currentUser?._id),
            );
            const myRole = isOwner ? "Owner" : myMemberEntry?.role || "Member";

            return (
              <div key={oneGroup._id} className="card">
                <div className="task-header">
                  <h4>{oneGroup.groupName}</h4>
                  <span className={`role-badge role-${myRole}`}>
                    {myRole === "Owner" ? <Shield size={12} /> : null} {myRole}
                  </span>
                </div>

                <div className="group-stats">
                  <p>
                    <UsersIcon size={14} /> {oneGroup.members.length} Members
                  </p>
                  <p>
                    <List size={14} /> {oneGroup.tasks?.length || 0} Tasks
                  </p>
                </div>

                <p className="created-by">
                  Created by: {oneGroup.createdBy?.username || "Unknown"}
                </p>

                <div className="card-actions">
                  <Link to={`/group/${oneGroup._id}`} className="view-link">
                    View Group <ArrowRight size={14} />
                  </Link>
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
  );
};

export default GroupListPage;
