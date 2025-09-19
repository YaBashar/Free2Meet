CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    name TEXT,
    password TEXT,
    email TEXT,
    num_successful_logins INTEGER,
    num_failed_since_last_login INTEGER
);

CREATE TABLE password_history (
    user_id INTEGER NOT NULL REFERENCES Users(id), 
    password TEXT,
    changed_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, changed_at)
);

CREATE TABLE refresh_token (
    user_id INTEGER NOT NULL REFERENCES Users(id), 
    token TEXT,
    created_at TIMESTAMP DEFAULT NOW(), 
    PRIMARY KEY (user_id, created_at)
);

CREATE TABLE reset_token (
    user_id INTEGER NOT NULL REFERENCES Users(id), 
    token TEXT,
    expiresAt INTEGER,
    PRIMARY KEY (user_id, expiresAt)
);

CREATE TABLE Events (
    id SERIAL PRIMARY KEY,
    title TEXT,
    description VARCHAR(20),
    location VARCHAR(20),
    date TEXT,
    startTime INTEGER,
    endTime INTEGER,
    organiser INTEGER NOT NULL REFERENCES Users(id)
);

CREATE TABLE event_participants (
    user_id INTEGER NOT NULL REFERENCES Users(id),
    event_id INTEGER NULL REFERENCES Events(id),
    name TEXT NOT NULL,
    status TEXT NOT NULL,
    startAvailability INTEGER,
    endAvailability INTEGER,
    PRIMARY KEY (user_id, event_id)
);

CREATE TABLE EventInvites (
    event_id INTEGER NOT NULL REFERENCES Events(id),
    link TEXT,
    PRIMARY KEY (event_id, link)
);
