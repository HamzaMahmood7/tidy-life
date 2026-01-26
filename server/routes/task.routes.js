const router = require('express').Router();

const UserModel = require('../models/User.Model')
const TaskModel = require('../models/Task.Model')

// Route to create a task
router.post('/create-task', async(req, res) => {
    try {
        const newTask = await TaskModel.create(req.body);
        console.log('Task created!', newTask)
        res.status(201).json(newTask)
    } catch (error) {
        console.log(error)
        res.status(500).json({errorMessage: 'failed to create task'})
    }
})

// route to get all the users tasks
router.get('/all-tasks', async(req, res) => {
    try {
        const allTasks = await TaskModel.find().populate()
        console.log('all the tasks!: ', allTasks)
        res.status(200).json(allTasks)
    } catch (error) {
        console.log(error);
        res.status(500).json({errorMessage: 'Could not get the tasks'})
    }
})

// route to get a specific task
router.get('/:taskId', async(req, res) => {
    try {
        const oneTask = await TaskModel.findById(req.params.taskId).select("title description status priority createdBy").populate({
            path: 'createdBy',
            select: "username email"
        })
        console.log('the specific task: ', oneTask)
        res.status(200).json(oneTask)
    } catch (error) {
        console.log(error);
        res.status(500).json({errorMessage: 'Could not get the specific task'})
    }   
})

// route to update a task
router.patch('/:taskId', async(req, res) => {
    try {
        const updatedTask = await TaskModel.findByIdAndUpdate(
            req.params.taskId,
            req.body,
            { new: true }
        )
        console.log('task was successfully updated: ', updatedTask);
        res.status(200).json(updatedTask)
    } catch (error) {
        console.log(error);
        res.status(500).json({errorMessage: 'Failed to update the task'})
    }
})

// route to delete a task
router.delete('/:taskId', async(req, res) => {
    try {
        const deletedTask = await TaskModel.findByIdAndDelete(req.params.taskId);
        console.log('task was deleted!: ', deletedTask);
        res.status(204).json(deletedTask)
    } catch (error) {
        console.log(error);
        res.status(500).json({errorMessage: 'Failed to delete the task'})
    }
})



module.exports = router;