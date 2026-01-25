const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const taskSchema =
  ({
    title: {
      type: String,
      required: true,
      trim: true      
    },
    description: {
      type: String,
      default: "Task Description",
    },
    status: {
        type: String,
        enum: ['To-do', 'In-progress', 'Completed'],
        default: 'To-do'
    },
    priority: {
        type: String,
        enum: ["Low", "Medium", "High"],
        default: 'Medium'
    },
    dueDate: {
        type: Date,
        default: null
    },
    assignedUserIds: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    assignedGroup: {
        type: Schema.Types.ObjectId,
        ref: 'Group',
        default: null // null = personal task
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    completedAt: {
        type: Date,
        default: null
    }
  },
  {
    timestamps: true,
  });

  const Task = mongoose.model("Task", taskSchema);

  module.exports = Task
