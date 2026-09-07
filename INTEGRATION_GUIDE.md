# Complete Integration Guide: How Everything Works Together

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     MOBILE APP (React Native)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │  Auth Screen │  │  Feed Screen │  │ Live Stream Screen   │  │
│  │  (Login)     │  │  (Videos)    │  │ (Real-time Chat)     │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │Upload Screen │  │Gift Shop     │  │Creator Dashboard     │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└────────────────────────────┬─────────────────────────────────────┘
                             │
                    ┌────────┴────────┐
                    ▼                 ▼
            REST API (HTTP)     WebSocket (Real-time)
                    │                 │
                    ▼                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Node.js + Express)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Auth Routes  │  │ Video Routes │  │  Live Routes         │  │
│  │ (JWT Token)  │  │ (Upload/Feed)│  │ (Agora Integration)  │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Gift Routes  │  │Payment Routes│  │ Socket.io Server     │  │
│  │(Monetization)│  │ (Stripe)     │  │ (Real-time Events)   │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────┬─────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
   ┌─────────────┐      ┌──────────────┐     ┌──────────────┐
   │ PostgreSQL  │      │    Redis     │     │   AWS S3     │
   │ (Database)  │      │   (Cache)    │     │  (Videos)    │
   └─────────────┘      └──────────────┘     └──────────────┘
        │                     │                     │
   User Data          Real-time Data          Video Files
   Videos             Live Chat               Thumbnails
   Likes/Comments     Active Users            User Avatars
   Followers          Gift Queue
   Payments
```

---

## 🔄 How Everything Connects - Step by Step

### 1️⃣ USER REGISTRATION & LOGIN

**Flow:**
```
User fills signup form
         ↓
POST /api/auth/register
         ↓
Backend hashes password + saves to PostgreSQL
         ↓
Returns JWT token
         ↓
Mobile app stores token in AsyncStorage
         ↓
Token sent with every API request (Authorization header)
```

**Code Example:**
```javascript
// Frontend (React Native)
const register = async (username, email, password) => {
  const response = await fetch('http://backend-url:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password })
  });
  const data = await response.json();
  await AsyncStorage.setItem('authToken', data.token);
};
```

---

### 2️⃣ VIDEO FEED & PLAYBACK

**Flow:**
```
User opens app
         ↓
GET /api/videos (REST API)
         ↓
Backend queries PostgreSQL for latest videos
         ↓
Returns video data with URLs from AWS S3
         ↓
Mobile app displays videos in ScrollView
         ↓
User scrolls → loads more videos (pagination)
```

**Database Flow:**
```
PostgreSQL videos table:
├── id (video ID)
├── user_id (creator)
├── video_url (S3 URL like: https://s3.amazonaws.com/bucket/videos/123.mp4)
├── thumbnail (S3 URL)
├── description
├── likes
├── comments
└── created_at
```

---

### 3️⃣ VIDEO UPLOAD

**Flow:**
```
User selects video
         ↓
POST /api/videos/upload (multipart/form-data)
         ↓
Backend receives video file
         ↓
Uploads to AWS S3 (returns S3 URL)
         ↓
Saves video metadata to PostgreSQL
         ↓
Returns video object to mobile
         ↓
Video appears in user's profile
```

**AWS S3 Upload Process:**
```javascript
// Backend
const params = {
  Bucket: 'tiktok-clone-bucket',
  Key: `videos/${Date.now()}.mp4`,
  Body: videoBuffer,
  ACL: 'public-read'
};
const s3Result = await s3.upload(params).promise();
// s3Result.Location = 'https://s3.amazonaws.com/bucket/videos/1694089200000.mp4'
```

---

### 4️⃣ LIKES & COMMENTS (Database + REST API)

**Like Flow:**
```
User taps ❤️ button
         ↓
POST /api/videos/:videoId/like
         ↓
Backend inserts into PostgreSQL likes table
         ↓
Updates video likes count
         ↓
Returns updated count to mobile
         ↓
UI updates instantly
```

**Database:**
```sql
-- likes table
INSERT INTO likes (video_id, user_id) VALUES (5, 12);

-- Query video with like count
SELECT v.*, COUNT(l.id) as likes 
FROM videos v 
LEFT JOIN likes l ON v.id = l.video_id 
WHERE v.id = 5;
```

---

### 5️⃣ LIVE STREAMING (Real-time + Agora)

**Flow:**
```
Creator starts live stream
         ↓
POST /api/live/start
         ↓
Backend creates live_room in PostgreSQL
         ↓
Generates Agora token for video streaming
         ↓
Returns token + room ID to creator's mobile
         ↓
Creator joins Agora RTC channel
         ↓
Mobile connects to Socket.io for live chat
```

**Viewers Join:**
```
Viewer sees live stream
         ↓
Clicks to join
         ↓
Socket.io: socket.emit('join-live', { liveRoomId, userId })
         ↓
Backend broadcasts 'user-joined' event
         ↓
All viewers notified: "User XYZ joined (Viewers: 145)"
```

**Agora Integration:**
```javascript
// Backend generates token
const token = RtcTokenBuilder.buildTokenWithUid(
  AGORA_APP_ID,
  AGORA_APP_CERT,
  channelName,
  uid,
  1 // Publisher role
);

// Frontend uses token to join channel
const rtcEngine = useRtcEngine();
await rtcEngine.joinChannel(token, channelName, null, uid);
```

---

### 6️⃣ REAL-TIME CHAT (Socket.io WebSocket)

**Connection Flow:**
```
User opens live stream
         ↓
Mobile connects: const socket = io('http://backend:5000')
         ↓
socket.emit('join-live', { liveRoomId, userId })
         ↓
Backend socket.on('join-live') → adds user to room
         ↓
io.to(`live-${liveRoomId}`).emit('user-joined') → broadcast
```

**Send Message:**
```javascript
// Frontend
socket.emit('send-message', {
  liveRoomId: 5,
  message: 'Nice stream!',
  userId: 12,
  username: 'john_doe'
});

// Backend
socket.on('send-message', (data) => {
  io.to(`live-${data.liveRoomId}`).emit('new-message', {
    message: data.message,
    username: data.username,
    timestamp: new Date()
  });
});

// Other viewers receive
socket.on('new-message', (message) => {
  setMessages([...messages, message]);
});
```

---

### 7️⃣ GIFT SYSTEM (Monetization)

**Send Gift Flow:**
```
Viewer selects gift (🌹 Rose = $1)
         ↓
POST /api/gifts/send
         ↓
Backend inserts gift transaction to PostgreSQL
         ↓
Deducts coins from viewer's account
         ↓
Adds 50% to creator's balance
         ↓
Socket.io broadcasts 'gift-received' event
         ↓
Creator sees gift animation + balance increases
```

**Database Transaction:**
```sql
-- Insert gift
INSERT INTO gifts (from_user_id, to_user_id, gift_id, amount) 
VALUES (12, 5, 'rose', 1);

-- Update creator's balance
UPDATE users SET balance = balance + 0.50 WHERE id = 5;

-- Update viewer's coin balance
UPDATE users SET coins = coins - 1 WHERE id = 12;
```

**Real-time Notification:**
```javascript
// Backend
socket.on('send-gift', (data) => {
  // Save to database
  await pool.query('INSERT INTO gifts...');
  
  // Broadcast to live room
  io.to(`live-${data.toUserId}`).emit('gift-received', {
    giftId: '🌹',
    fromUser: 'john_doe',
    value: 0.50
  });
});

// Creator's mobile receives
socket.on('gift-received', (gift) => {
  showGiftAnimation(gift.giftId); // 🎬 Animation
  setEarnings(earnings + gift.value); // 💰 Update balance
});
```

---

### 8️⃣ PAYMENT & WITHDRAWALS (Stripe)

**Withdraw Earnings Flow:**
```
Creator taps "Withdraw"
         ↓
Enters amount: $100
         ↓
POST /api/payments/withdraw
         ↓
Backend verifies balance in PostgreSQL
         ↓
Creates Stripe transfer to creator's bank account
         ↓
Deducts from creator's balance
         ↓
Logs transaction to withdrawals table
         ↓
Creator receives notification
```

**Stripe Integration:**
```javascript
// Backend
const transfer = await stripe.transfers.create({
  amount: 10000, // $100 in cents
  currency: 'usd',
  destination: creator.stripe_account_id
});

// Update database
await pool.query(
  'UPDATE users SET balance = balance - $1 WHERE id = $2',
  [100, creatorId]
);

await pool.query(
  'INSERT INTO withdrawals (user_id, amount, stripe_transfer_id, status) VALUES ($1, $2, $3, $4)',
  [creatorId, 100, transfer.id, 'completed']
);
```

---

## 🔗 Complete User Journey Example

### "John creates a live stream and receives gifts"

```
1. JOHN (Creator) Opens App
   ├─ Auth: POST /api/auth/login → Gets JWT token
   └─ Stored in AsyncStorage

2. JOHN Starts Live Stream
   ├─ POST /api/live/start
   ├─ Backend: Creates live_room (PostgreSQL)
   ├─ Generates Agora token
   └─ Mobile: Joins Agora channel (video stream starts)

3. JOHN Opens Socket.io Connection
   ├─ socket.emit('join-live', { liveRoomId: 5, userId: 1 })
   ├─ Backend: Adds to room `live-5`
   └─ Others notified: "John started streaming"

4. SARAH (Viewer) Opens App
   ├─ Auth: POST /api/auth/login
   └─ GET /api/live → Sees John's stream

5. SARAH Joins Live Stream
   ├─ Socket.io: socket.emit('join-live', { liveRoomId: 5, userId: 2 })
   ├─ Backend: Adds Sarah to room `live-5`
   ├─ Backend: io.to('live-5').emit('user-joined', {userId: 2})
   └─ John sees: "Sarah joined (Viewers: 1)"

6. SARAH Sends Message
   ├─ socket.emit('send-message', {liveRoomId: 5, message: 'Amazing!'})
   ├─ Backend: io.to('live-5').emit('new-message', {...})
   └─ Both see message in chat

7. SARAH Sends Gift (Rose = $1)
   ├─ socket.emit('send-gift', {liveRoomId: 5, giftId: 'rose', amount: 1})
   ├─ Backend:
   │  ├─ INSERT gift transaction (PostgreSQL)
   │  ├─ UPDATE john.balance += 0.50 (PostgreSQL)
   │  └─ io.to('live-5').emit('gift-received', {emoji: '🌹', value: 0.50})
   ├─ John's mobile:
   │  ├─ 🌹 Animation plays
   │  ├─ Balance updates: $10.50 → $11.00
   │  └─ Notification: "Sarah sent you a Rose!"
   └─ Sarah sees: "Gift sent! ✓"

8. Stream Ends
   ├─ John: POST /api/live/:liveRoomId/end
   ├─ Backend: UPDATE live_rooms SET status = 'ended'
   └─ All viewers disconnected

9. JOHN Checks Earnings
   ├─ GET /api/creators/:userId/dashboard
   ├─ Backend queries:
   │  ├─ SUM(gifts.amount) * 0.50 as earnings
   │  ├─ COUNT(followers) as followers
   │  └─ SELECT * FROM live_viewers WHERE live_room_id = X
   └─ Dashboard shows: $11.00 earned, 1 gift received

10. JOHN Withdraws Earnings
    ├─ POST /api/payments/withdraw (amount: $11.00)
    ├─ Backend:
    │  ├─ stripe.transfers.create({...}) → Sends to John's bank
    │  ├─ UPDATE users SET balance = 0
    │  └─ INSERT INTO withdrawals
    └─ John receives notification: "Withdrawal processed!"
```

---

## 📊 Data Flow Summary

| Component | Purpose | Technology | Data Flow |
|-----------|---------|-----------|-----------|
| **Auth** | User login/signup | JWT + bcrypt | REST API → PostgreSQL |
| **Videos** | Upload & feed | AWS S3 + PostgreSQL | REST API → S3 + DB |
| **Live Stream** | Video broadcasting | Agora SDK | Real-time video |
| **Chat** | Real-time messaging | Socket.io + Redis | WebSocket events |
| **Gifts** | Monetization | Socket.io + PostgreSQL | WebSocket → DB |
| **Payments** | Withdrawals | Stripe + PostgreSQL | REST API → Stripe → DB |
| **Cache** | Performance | Redis | Socket.io sessions |

---

## 🚀 How to Deploy

### Backend Deployment (Heroku/AWS)
```bash
# 1. Push to GitHub
git add .
git commit -m "TikTok clone backend"
git push origin main

# 2. Deploy to Heroku
heroku create tiktok-clone-api
git push heroku main

# 3. Set environment variables
heroku config:set DATABASE_URL=postgresql://...
heroku config:set STRIPE_SECRET_KEY=sk_live_...
heroku config:set AGORA_APP_ID=...

# 4. Run database migrations
heroku run psql -f database/schema.sql
```

### Frontend Deployment (React Native)
```bash
# 1. Update API URL in code
const API_URL = 'https://tiktok-clone-api.herokuapp.com';

# 2. Build for iOS
eas build --platform ios --auto-submit

# 3. Build for Android
eas build --platform android --auto-submit

# 4. Submit to App Store & Google Play
eas submit --platform ios
eas submit --platform android
```

---

## ✅ Everything is Connected!

Your TikTok-like app now has:
- ✅ User authentication with JWT
- ✅ Video upload to AWS S3
- ✅ Real-time video streaming with Agora
- ✅ Live chat with Socket.io
- ✅ Gift system with monetization
- ✅ Payment processing with Stripe
- ✅ Creator dashboard with earnings
- ✅ Database persistence with PostgreSQL
- ✅ Real-time cache with Redis

All components work together autonomously! 🎉
