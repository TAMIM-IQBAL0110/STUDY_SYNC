
import express from 'express'
import connectDB from './config/db.js';
import authRoute from './routes/authRoute.js';
import dashboardRoute from './routes/dashboardRoute.js'
import taskRoutes from './routes/taskRoutes.js'
import categoryRoute from './routes/categoryRoute.js'
import cors from 'cors';
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'

// Force rebuild: Clear Render cache - using Brevo email service only
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express();
// Middleware that parses incoming JSON requests
app.use(express.json());

const allowedOrigins = (process.env.CLIENT_URL || "https://studysy.netlify.app,http://localhost:5173,http://localhost:3000").split(',').map(url => url.trim());

// Middleware to handle CORS
app.use(
    cors({
        origin: function (origin, callback) {
            // Allow requests with no origin (like mobile apps or Postman)
            // Allow Chrome extension requests
            // Allow localhost for development
            // Allow configured CLIENT_URL
            console.log(`🔍 CORS request from origin: ${origin || 'no-origin'}`);
            if (
                !origin || 
                (origin && origin.startsWith('chrome-extension://')) ||
                (origin && origin.includes('localhost')) ||
                (origin && origin.includes('netlify.app')) ||
                allowedOrigins.includes('*') || 
                (origin && allowedOrigins.includes(origin))
            ) {
                console.log(`✅ CORS allowed`);
                callback(null, true);
            } else {
                console.warn(`❌ CORS blocked origin: ${origin}`);
                callback(new Error('Not allowed by CORS'));
            }
        },
        methods: ["GET", "POST", "DELETE", "PUT"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true
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
app.use("/api/v1/category",categoryRoute);

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
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📅 Started at: ${new Date().toISOString()}`);
});
