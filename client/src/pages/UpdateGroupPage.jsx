import axios from "axios";
import React, { useEffect, useState, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import { AuthContext } from "../contexts/AuthContext";
import { API_URL } from "../../config/config";
import { Users, Save, XCircle } from "lucide-react";
import toast from "react-hot-toast";

const UpdateGroupPage = () => {
  const { groupId } = useParams();
  const { currentUser } = useContext(AuthContext);
  const nav = useNavigate();
  const tokenForAuth = localStorage.getItem("authToken");

  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      if (!currentUser || !tokenForAuth) return;

      try {
        const headers = { authorization: `Bearer ${tokenForAuth}` };

        const [usersRes, groupRes] = await Promise.all([
          axios.get(`${API_URL}/user/all-users`, { headers }),
          axios.get(`${API_URL}/group/${groupId}`, { headers }),
        ]);

        const groupData = groupRes.data;

        const ownerId = groupData.createdBy?._id || groupData.createdBy;
        if (String(ownerId) !== String(currentUser._id)) {
          toast.error("Unauthorized: Only the owner can edit this group");
          nav(`/group/${groupId}`);
          return;
        }

        const mappedUsers = usersRes.data.map((user) => ({
          value: user._id,
          label: user.username,
        }));

        setAllUsers(mappedUsers);
        setGroupName(groupData.groupName);

        const mappedMembers = groupData.members.map((member) => ({
          value: member.userId?._id || member.userId,
          label: member.userId?.username || "Member",
        }));

        setSelectedMembers(mappedMembers);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load group info");
        nav("/dashboard");
      }
    };

    getData();
  }, [groupId, currentUser, nav, tokenForAuth]);

  const handleUpdateGroup = async (event) => {
    event.preventDefault();

    const updatedGroupData = {
      groupName,
      members: selectedMembers.map((option) => ({
        userId: option.value,
      })),
    };

    try {
      const res = await axios.patch(
        `${API_URL}/group/${groupId}`,
        updatedGroupData,
        { headers: { authorization: `Bearer ${tokenForAuth}` } },
      );

      console.log("Group updated!", res.data);
      toast.success("Group settings updated!");
      nav(`/group/${groupId}`);
    } catch (error) {
      console.error("failed to update group: ", error);
      toast.error("Error saving group changes");
    }
  };

  if (isLoading) return <p className="empty-msg">Loading group settings...</p>;

  return (
    <div className="group-details-container">
      <h1 className="page-title">
        <Users size={28} /> Update Group Settings
      </h1>

      <form onSubmit={handleUpdateGroup} className="card shadow-sm">
        <div className="form-group">
          <label>Group Name</label>
          <input
            className="custom-input"
            value={groupName}
            onChange={(event) => setGroupName(event.target.value)}
            required
            placeholder="Edit group name"
          />
        </div>

        <div className="form-group">
          <label>Manage Members</label>
          <Select
            isMulti
            options={allUsers}
            value={selectedMembers}
            onChange={(selectedOptions) => setSelectedMembers(selectedOptions)}
            placeholder="Search and add members..."
            className="react-select-container"
          />
          <small style={{ color: "#ffa500", marginTop: "4px" }}>
            Removing a user here will remove them from the group immediately.
          </small>
        </div>

        <div className="dashboard-footer-actions">
          <button type="submit" className="btn-primary">
            <Save size={18} /> Update Group
          </button>
          <button
            type="button"
            onClick={() => nav(`/group/${groupId}`)}
            className="btn-secondary"
          >
            <XCircle size={18} /> Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateGroupPage;

