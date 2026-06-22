import express from 'express';
import http from 'http';
import cors from 'cors';
import { Server } from 'socket.io';
import apiRouter from './controllers/apiController.js';
import reportRouter from './controllers/reportController.js';
import { ensureDataDir } from './utils/storage.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.locals.io = io;

app.use('/api', apiRouter);
app.use('/api/reports', reportRouter);

app.get('/', (req, res) => {
  res.json({ status: 'ok', name: 'Aegis-AI backend' });
});

io.on('connection', (socket) => {
  console.log('Client connected', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
  });
});

const PORT = Number(process.env.PORT || 4000);
ensureDataDir();
server.listen(PORT, () => {
  console.log(`Aegis-AI backend listening on http://localhost:${PORT}`);
});
