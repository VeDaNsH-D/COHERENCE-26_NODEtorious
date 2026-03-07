const mongoose = require("mongoose");

const workflowSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },

        description: {
            type: String
        },

        nodes: {
            type: Array,
            default: []
        },

        edges: {
            type: Array,
            default: []
        },

        status: {
            type: String,
            enum: ["draft", "active", "paused", "completed", "failed", "running"],
            default: "draft"
        },

        created_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Workflow", workflowSchema);