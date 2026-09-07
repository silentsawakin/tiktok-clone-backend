-- Users Table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  avatar VARCHAR(255),
  bio TEXT,
  balance DECIMAL(10, 2) DEFAULT 0,
  stripe_account_id VARCHAR(255),
  followers INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Videos Table
CREATE TABLE videos (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  description TEXT,
  video_url VARCHAR(255) NOT NULL,
  thumbnail VARCHAR(255),
  likes INT DEFAULT 0,
  comments INT DEFAULT 0,
  views INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Likes Table
CREATE TABLE likes (
  id SERIAL PRIMARY KEY,
  video_id INT REFERENCES videos(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(video_id, user_id)
);

-- Comments Table
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  video_id INT REFERENCES videos(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Followers Table
CREATE TABLE followers (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  follower_id INT REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, follower_id)
);

-- Live Rooms Table
CREATE TABLE live_rooms (
  id SERIAL PRIMARY KEY,
  creator_id INT REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Live Viewers Table
CREATE TABLE live_viewers (
  id SERIAL PRIMARY KEY,
  live_room_id INT REFERENCES live_rooms(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Gifts Table
CREATE TABLE gifts (
  id SERIAL PRIMARY KEY,
  from_user_id INT REFERENCES users(id) ON DELETE CASCADE,
  to_user_id INT REFERENCES users(id) ON DELETE CASCADE,
  gift_id VARCHAR(50),
  amount DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Withdrawals Table
CREATE TABLE withdrawals (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2),
  stripe_transfer_id VARCHAR(255),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);