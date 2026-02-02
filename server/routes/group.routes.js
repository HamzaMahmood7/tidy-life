const router = require("express").Router();

const { isAuthenticated } = require("../middlewares/jwt.middleware");
const GroupModel = require("../models/Group.Model");

// route to create a group
router.post("/create-group", isAuthenticated, (req, res) => {
  const ownerId = req.payload._id; // get the id from the token

  const incomingMembers = req.body.members || [];

  // force the creator to be included in the members list with the role of 'owner'
  const finalMembers = [...incomingMembers, { userId: ownerId, role: "Owner" }];

  GroupModel.create({
    groupName: req.body.groupName,
    createdBy: ownerId,
    members: finalMembers,
  })
    .then((groupData) => {
      console.log("group was created! ", groupData);
      res.status(201).json(groupData);
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({ errorMessage: "failed to create group" });
    });
});

// route to get all group that the user is part of
router.get("/all-groups", isAuthenticated, (req, res) => {
  const userId = req.payload._id;
  GroupModel.find({
    "members.userId": userId,
  })
    .populate("createdBy", "username") // gets the group owners name
    .populate("members.userId", "username") // gets the usernames for all members
    .populate("tasks")
    .then((groupData) => {
      console.log(groupData);
      res.status(200).json(groupData);
    })
    .catch((error) => {
      console.log(error);
      res
        .status(500)
        .json({ errorMessage: "failed to get all of the users groups" });
    });
});

// route to get the 3 groups for the dashboard page
router.get("/dashboard-groups", isAuthenticated, async (req, res) => {
  try {
    const threegroups = await GroupModel.find({
      $or: [
        { createdBy: req.payload._id },
        { "members.userId": req.payload._id },
      ],
    })
      .limit(3)
      .populate("createdBy", "_id username")
      .populate("members.userId", "username");
    res.status(200).json(threegroups);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: "Could not get the top 3 tasks" });
  }
});

// route to get a single group
router.get("/:groupId", isAuthenticated, async (req, res) => {
  try {
    const oneGroup = await GroupModel.findById(req.params.groupId)
      .populate("createdBy", "username")
      .populate("members.userId", "username")
      .populate("tasks");

    if (!oneGroup) {
      return res.status(404).json({ message: "Group not found" });
    }
    console.log("the specific group ", oneGroup);
    res.status(200).json(oneGroup);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: "failed to get this specific group" });
  }
});

// route to update a group
router.patch("/:groupId", isAuthenticated, async (req, res) => {
  try {
    const group = await GroupModel.findById(req.params.groupId);

    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (String(group.createdBy) !== String(req.payload._id)) {
      return res.status(403).json({ message: "Only owner can edit" });
    }

    if (req.body.members) {
      const ownerId = String(group.createdBy);
      const isOwnerInList = req.body.members.filter(member => String(member.userId) !== ownerId);
      
      req.body.members = [{ userId: ownerId, role: "Owner" }, ...isOwnerInList];
    }

    const updatedGroup = await GroupModel.findByIdAndUpdate(
      req.params.groupId,
      req.body,
      { new: true },
    );

    console.log("updated the group! ", updatedGroup);
    res.status(200).json(updatedGroup);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ errorMessage: "failed to update this specific group" });
  }
});

// route to delete a group and all its tasks only if the user is the owner
router.delete("/:groupId", isAuthenticated, async (req, res) => {
  try {
    const group = await GroupModel.findById(req.params.groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (String(group.createdBy) !== String(req.payload._id)) {
      return res
        .status(403)
        .json({ message: "Only the owner can delete this group" });
    }

    await GroupModel.findByIdAndDelete(req.params.groupId);
    await TaskModel.deleteMany({ assignedGroup: req.params.groupId });

    res.status(200).json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
