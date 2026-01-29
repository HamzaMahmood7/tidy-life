const router = require("express").Router();

const { isAuthenticated } = require("../middlewares/jwt.middleware");
const GroupModel = require("../models/Group.Model");

// route to create a group
router.post("/create-group", isAuthenticated, (req, res) => {
  const ownerId = req.payload._id; // get the id from the token

  // force the creator to be included in the members list with the role of 'owner'
  const finalMembers = [
    ...req.body.members,
    { userId: ownerId, role: "Owner" },
  ];

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
      .select()
      .populate();
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
    const updatedGroup = await GroupModel.findByIdAndUpdate(
      req.params.groupId,
      req.body,
      { new: true },
    );
    console.log("update the group ", updatedGroup);
    res.status(200).json(updatedGroup);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ errorMessage: "failed to update this specific group" });
  }
});

// route to delete a group
router.delete("/:groupId", isAuthenticated, (req, res) => {
  GroupModel.findByIdAndDelete(req.params.groupId)
    .then((groupData) => {
      console.log("deleted group: ", groupData);
      res.status(204).json(groupData);
    })
    .catch((error) => {
      console.log(error);
      res
        .status(500)
        .json({ errorMessage: "failed to delete this specific group" });
    });
});

module.exports = router;
