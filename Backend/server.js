
import express from 'express'
import connectDB from './config/db.js';
import authRoute from './routes/authRoute.js';
import dashboardRoute from './routes/dashboardRoute.js'
import taskRoutes from './routes/taskRoutes.js'
import cors from 'cors';
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express();
// Middleware that parses incoming JSON requests
app.use(express.json());

//Middleware to handle CORS
app.use(
    cors({
        origin:process.env.CLIENT_URL || "*",
        methods:["GET","POST","DELETE","PUT"],
        allowedHeaders:["Content-Type","Authorization"]
    })
);

// Static file serving for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// connect to MongoDB
connectDB();

app.use("/api/v1/auth",authRoute);
app.use("/api/v1/dashboard",dashboardRoute);
app.use("/api/v1/task",taskRoutes);

// Use environment variable PORT if available, otherwise default to 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));