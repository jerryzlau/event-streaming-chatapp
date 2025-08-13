import dotenv from 'dotenv';
dotenv.config();
import express, { Request, Response, NextFunction } from 'express';
import chatRoutes from './routes/chat';

const app = express();
const port = 3001;

// Middleware to parse JSON bodies
app.use(express.json());

// Enable CORS
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Routes
app.use(chatRoutes);

app.get('/ping', (req: Request, res: Response) => {
  res.sendStatus(200);
});

// Error handling for undefined routes
app.use((req: Request, res: Response) => {
  res.status(404).send('Not Found');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
