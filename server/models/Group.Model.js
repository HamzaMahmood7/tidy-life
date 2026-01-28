const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const groupSchema = new Schema(
  {
    groupName: {
      type: String,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        role: {
          type: String,
          enum: ["Owner", "Admin", "Member"],
          default: "Member",
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    tasks: [
      {
        type: Schema.Types.ObjectId,
        ref: "Task"
      }
    ]
  },
  {
    timestamps: true,
  },
);

const Group = mongoose.model("Group", groupSchema);

module.exports = Group;
