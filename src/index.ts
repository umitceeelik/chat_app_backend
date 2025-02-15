import express, { Request, Response } from 'express';
import {json} from 'body-parser';
import http from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/authRoutes';
import conversationRoutes from './routes/conversationRoutes';
import messagesRoutes from './routes/messagesRoutes';
import contactsRoutes from './routes/contactsRoutes';
import { saveMessage } from './controllers/messageController';
import './cron/cronJob';

const app = express();
const server = http.createServer(app);
app.use(json());
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

app.use('/auth', authRoutes);
app.use('/conversations', conversationRoutes);
app.use('/messages', messagesRoutes);
app.use('/contacts', contactsRoutes);

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('joinConversation', (conversationId) => {
    socket.join(conversationId);
    console.log('User joined conversation: ' + conversationId);

  });

  socket.on('sendMessage', async (message) => {
    const {conversationId, senderId, content} = message;
    console.log('message: ' + message);

    try {
      const savedMessage = await saveMessage(conversationId, senderId, content);
      console.log('sendMessage:');
      console.log(savedMessage);
      io.to(conversationId).emit('newMessage', savedMessage);

      io.emit('conversationUpdated', {
        conversationId,
        lastMessage: savedMessage.content,
        lastMessageTime: savedMessage.createdAt,
      });

    } catch (error) {
      console.error('Error saving message: ' + error);
      throw new Error('Failed to save message');
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected: ' + socket.id);
  });

});

app.get('/', (req: Request, res: Response) => {
    console.log('Hello World');
    res.send('yes works');
});

const PORT = process.env.PORT || 6000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
