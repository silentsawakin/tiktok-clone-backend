# TikTok Clone - Backend

A complete backend system for a TikTok-like app with live streaming, gifts, and monetization.

## Features

✅ User Authentication (JWT)
✅ Video Upload & Streaming (AWS S3)
✅ Live Streaming (Agora)
✅ Real-time Chat (Socket.io)
✅ Gift System with Monetization
✅ Payment Processing (Stripe)
✅ Creator Dashboard
✅ Follow System
✅ Comments & Likes

## Tech Stack

- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Real-time**: Socket.io
- **Video Streaming**: Agora SDK
- **Storage**: AWS S3
- **Payments**: Stripe
- **Cache**: Redis

## Setup

1. Clone repository
2. Install dependencies: `npm install`
3. Configure `.env` file
4. Run database schema: `psql -f database/schema.sql`
5. Start server: `npm run dev`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user

### Videos
- `GET /api/videos` - Get feed
- `POST /api/videos/upload` - Upload video
- `POST /api/videos/:videoId/like` - Like video

### Live
- `POST /api/live/start` - Start live stream
- `POST /api/live/:liveRoomId/end` - End live stream
- `GET /api/live` - Get active live streams

### Gifts
- `POST /api/gifts/send` - Send gift
- `GET /api/gifts/:userId/history` - Get gift history

### Payments
- `POST /api/payments/withdraw` - Withdraw earnings
- `GET /api/payments/:userId/history` - Get withdrawal history

## WebSocket Events

- `join-live` - Join live room
- `leave-live` - Leave live room
- `send-message` - Send chat message
- `send-gift` - Send gift
- `new-message` - Receive chat message
- `gift-received` - Receive gift
- `user-joined` - User joined stream
- `user-left` - User left stream

## Frontend Integration

The frontend connects via:
- REST API for data fetching
- WebSocket for real-time updates
- Agora SDK for video streaming

## License

MIT