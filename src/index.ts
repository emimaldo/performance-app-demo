import express from 'express';
import dotenv from 'dotenv';
import { getUserProfile } from './cache';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.get('/user/:id', async (req, res) => {
  try {
    const user = await getUserProfile(req.params.id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
