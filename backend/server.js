import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import { AgentManager } from './agents/agentManager.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, '../frontend')));

// Initialize Agent Manager
const agentManager = new AgentManager();

// REST API Endpoints
app.get('/api/agents', async (req, res) => {
  const agents = await agentManager.getAgentsStatus();
  res.json(agents);
});

app.get('/api/agents/:id', async (req, res) => {
  const agent = await agentManager.getAgentStatus(req.params.id);
  if (agent) {
    res.json(agent);
  } else {
    res.status(404).json({ error: 'Agent not found' });
  }
});

app.post('/api/agents/:id/donate', async (req, res) => {
  const { amount } = req.body;
  try {
    const result = await agentManager.donateToAgent(req.params.id, amount);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/agents/reset', async (req, res) => {
  try {
    await agentManager.resetAllAgents();
    res.json({ message: 'All agents reset successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start HTTP server
const server = app.listen(PORT, () => {
  console.log(`🚀 Agent Games server running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
});

// WebSocket Server
const wss = new WebSocketServer({ server });

wss.on('connection', async (ws) => {
  console.log('🔌 New client connected');
  
  // Send initial agent status
  const agentsStatus = await agentManager.getAgentsStatus();
  ws.send(JSON.stringify({
    type: 'initial',
    data: agentsStatus
  }));
  
  ws.on('close', () => {
    console.log('🔌 Client disconnected');
  });
});

// Broadcast updates to all connected clients
agentManager.on('update', (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      client.send(JSON.stringify({
        type: 'update',
        data: data
      }));
    }
  });
});

agentManager.on('trade', (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify({
        type: 'trade',
        data: data
      }));
    }
  });
});

agentManager.on('death', (data) => {
  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(JSON.stringify({
        type: 'death',
        data: data
      }));
    }
  });
});

// Start the agent simulation
agentManager.start();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await agentManager.stop();
  server.close();
  process.exit(0);
});

