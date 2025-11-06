import express from 'express';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());
app.disable('x-powered-by');

const PORT = process.env.PORT || 3000;

import routes from './routes';
app.use('/api', routes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});