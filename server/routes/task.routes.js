const router = require("express").Router();

const UserModel = require("../models/User.Model");
const TaskModel = require("../models/Task.Model");
const { isAuthenticated } = require("../middlewares/jwt.middleware");

// Route to create a task
router.post("/create-task", isAuthenticated, async (req, res) => {
  try {
    const newTask = await TaskModel.create({
      ...req.body,
      createdBy: req.payload._id,
    });
    console.log("Task created!", newTask);
    res.status(201).json(newTask);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: "failed to create task" });
  }
});

// route to get all the users tasks
router.get("/all-tasks", isAuthenticated, async (req, res) => {
  try {
    const userId = req.payload._id;
    const allTasks = await TaskModel.find({
      // find the tasks the user created or was assigned to by other users
      $or: [{ createdBy: userId }, { assignedUserIds: userId }],
    })
      .populate("assignedUserIds", "username")
      .populate("assignedGroup", "groupName");
    console.log("all the tasks!: ", allTasks);
    res.status(200).json(allTasks);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: "Could not get the tasks" });
  }
});

// route to get the top 3 tasks for the dashboard page
router.get("/dashboard-tasks", isAuthenticated, async (req, res) => {
  try {
    const topThreeTasks = await TaskModel.find({ createdBy: req.payload._id })
      .sort({ priority: -1 })
      .limit(3);
    console.log("top 3 tasks", topThreeTasks);
    res.status(200).json(topThreeTasks);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: "Could not get the top 3 tasks" });
  }
});

// route to get a specific task
router.get("/:taskId", isAuthenticated, async (req, res) => {
  try {
    const oneTask = await TaskModel.findById(req.params.taskId)
      .populate("assignedUserIds", "username")
      .populate("assignedGroup", "groupName")
      .populate("createdBy", "username email");
    console.log("the specific task: ", oneTask);
    res.status(200).json(oneTask);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: "Could not get the specific task" });
  }
});

// route to update a task
router.patch("/:taskId", isAuthenticated, async (req, res) => {
  try {
    const updatedTask = await TaskModel.findByIdAndUpdate(
      req.params.taskId,
      req.body,
      { new: true },
    )
      .populate("assignedUserIds", "username")
      .populate("assignedGroup", "groupName");
      
    console.log("task was successfully updated: ", updatedTask);
    res.status(200).json(updatedTask);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: "Failed to update the task" });
  }
});

// route to delete a task
router.delete("/:taskId", isAuthenticated, async (req, res) => {
  try {
    const deletedTask = await TaskModel.findByIdAndDelete(req.params.taskId);
    console.log("task was deleted!: ", deletedTask);
    res.status(200).json(deletedTask);
  } catch (error) {
    console.log(error);
    res.status(500).json({ errorMessage: "Failed to delete the task" });
  }
});

module.exports = router;
