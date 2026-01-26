const router = require("express").Router();

const GroupModel = require("../models/Group.Model");

// route to create a group
router.post("/create-group", (req, res) => {
  GroupModel.create(req.body)
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
router.get("/all-groups", (req, res) => {
  GroupModel.find()
    .populate()
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

// route to get a single group
router.get("/:groupId", async (req, res) => {
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
router.patch("/:groupId", async (req, res) => {
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
router.delete("/:groupId", (req, res) => {
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
