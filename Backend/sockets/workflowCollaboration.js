const { Server } = require('socket.io');

/**
 * Socket.IO Implementation for Real-Time Workflow Collaboration
 * Handles node updates, edge updates, workflow synchronization and cursors
 */
module.exports = (server) => {
  const io = new Server(server, {
    cors: {
      origin: '*', // Adjust to specific frontend URL in production
      methods: ['GET', 'POST']
    }
  });

  // Track users in rooms to handle disconnects gracefully
  // format: { socketId: { workflowId, user: { id, name, color } } }
  const roomUsers = new Map();

  io.on('connection', (socket) => {
    console.log(`[WorkflowCollaboration] 🟢 Client connected: ${socket.id}`);

    // Join a specific workflow room to isolate events
    socket.on('join-workflow', (data) => {
      // support both string ID and object { workflowId, user }
      let workflowId = data;
      let user = null;
      
      if (typeof data === 'object' && data !== null) {
        workflowId = data.workflowId;
        user = data.user;
      }
      
      socket.join(workflowId);
      console.log(`[WorkflowCollaboration] 🚪 Client ${socket.id} joined workflow room: ${workflowId}`);
      
      if (user) {
        roomUsers.set(socket.id, { workflowId, user });
      } else {
        roomUsers.set(socket.id, { workflowId, user: { id: socket.id, name: 'Guest', color: '#60a5fa' } });
      }
    });

    // Handle node updates
    socket.on('node-update', (data) => {
      const { workflowId, nodeData } = data;
      console.log(`[WorkflowCollaboration] 🔄 Node updated in workflow ${workflowId}:`, nodeData?.id);
      
      // Broadcast to everyone in the room EXCEPT the sender
      socket.to(workflowId).emit('node-updated', nodeData);
    });

    // Handle edge updates
    socket.on('edge-update', (data) => {
      const { workflowId, edgeData } = data;
      console.log(`[WorkflowCollaboration] 🔗 Edge updated in workflow ${workflowId}:`, edgeData?.id);
      
      // Broadcast to everyone in the room EXCEPT the sender
      socket.to(workflowId).emit('edge-updated', edgeData);
    });

    // Workflow sync
    socket.on('workflow-sync', (data) => {
      const { workflowId, state } = data;
      console.log(`[WorkflowCollaboration] 🔁 Syncing workflow state for ${workflowId}`);
      
      // Broadcast to everyone in the room EXCEPT the sender
      socket.to(workflowId).emit('workflow-synced', state);
    });
    
    // Handle cursor updates
    socket.on('cursor-update', (data) => {
      const { workflowId, x, y, user } = data;
      
      // Build the cursor data payload
      const cursorPayload = {
        socketId: socket.id,
        x,
        y,
        user: user || roomUsers.get(socket.id)?.user
      };
      
      // Broadcast to everyone in the room EXCEPT the sender
      // This happens constantly so we avoid logging every move
      socket.to(workflowId).emit('cursor-updated', cursorPayload);
    });

    socket.on('leave-workflow', (workflowId) => {
      socket.leave(workflowId);
      console.log(`[WorkflowCollaboration] 👋 Client ${socket.id} left workflow room: ${workflowId}`);
      
      // Notify others that this user's cursor should be removed
      socket.to(workflowId).emit('collaborator-left', socket.id);
      
      roomUsers.delete(socket.id);
    });

    socket.on('disconnect', () => {
      console.log(`[WorkflowCollaboration] 🔴 Client disconnected: ${socket.id}`);
      
      const userData = roomUsers.get(socket.id);
      if (userData) {
        // Notify others in the room that this user left
        io.to(userData.workflowId).emit('collaborator-left', socket.id);
        roomUsers.delete(socket.id);
      }
    });
  });

  return io;
};