
import express from 'express'
import connectDB from './config/db.js';
import authRoute from './routes/authRoute.js';
import dashboardRoute from './routes/dashboardRoute.js'
import taskRoutes from './routes/taskRoutes.js'
import cors from 'cors';
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'

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

// Health check endpoint
app.get('/health', (req, res) => {
    const dbConnected = mongoose.connection.readyState === 1;
    res.status(200).json({ 
        status: 'Server is running',
        database: dbConnected ? 'connected' : 'disconnected',
        timestamp: new Date() 
    });
});

// connect to MongoDB
connectDB();

app.use("/api/v1/auth",authRoute);
app.use("/api/v1/dashboard",dashboardRoute);
app.use("/api/v1/task",taskRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Server error:', err);
    res.status(500).json({ 
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'production' ? 'Server error' : err.message
    });
});

// Use environment variable PORT if available, otherwise default to 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));