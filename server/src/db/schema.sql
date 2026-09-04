-- LinguaVoice AI PostgreSQL Database Schema

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    target_language VARCHAR(50) DEFAULT 'Spanish',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS practice_sessions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_language VARCHAR(50) NOT NULL,
    audio_url TEXT,
    transcription TEXT NOT NULL,
    corrected_sentence TEXT NOT NULL,
    natural_sentence TEXT NOT NULL,
    grammar_score INTEGER NOT NULL,
    vocabulary_score INTEGER NOT NULL,
    naturalness_score INTEGER NOT NULL,
    feedback TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mistakes (
    id VARCHAR(36) PRIMARY KEY,
    session_id VARCHAR(36) NOT NULL REFERENCES practice_sessions(id) ON DELETE CASCADE,
    mistake_type VARCHAR(100) NOT NULL,
    original_text TEXT NOT NULL,
    corrected_text TEXT NOT NULL,
    explanation TEXT NOT NULL
);

-- Indices for performance
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON practice_sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mistakes_session_id ON mistakes(session_id);
CREATE INDEX IF NOT EXISTS idx_mistakes_type ON mistakes(mistake_type);
