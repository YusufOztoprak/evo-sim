import mongoose from 'mongoose';

let isConnected = false;

export async function connectDb(uri?: string): Promise<void> {
    if (isConnected) return;

    const connectionUri = uri ?? process.env.MONGODB_URI;
    if (!connectionUri) {
        throw new Error('MONGODB_URI is not set');
    }

    await mongoose.connect(connectionUri, {
        // Keep pool size generous for simulation workloads
        maxPoolSize: 20,
        minPoolSize: 5,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log(`[db] Connected to MongoDB`);

    mongoose.connection.on('disconnected', () => {
        isConnected = false;
        console.warn('[db] MongoDB disconnected');
    });

    mongoose.connection.on('error', (err) => {
        console.error('[db] MongoDB error:', err);
    });
}

export async function disconnectDb(): Promise<void> {
    if (!isConnected) return;
    await mongoose.disconnect();
    isConnected = false;
}