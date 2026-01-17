-- Predusk Portfolio Manager - Database Schema
-- PostgreSQL / SQLite compatible

-- Profile table: stores user profile information
CREATE TABLE api_profile (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(254) NOT NULL,
    education VARCHAR(100) NOT NULL,
    github VARCHAR(200) DEFAULT '',
    linkedin VARCHAR(200) DEFAULT '',
    portfolio VARCHAR(200) DEFAULT ''
);

CREATE INDEX idx_profile_email ON api_profile(email);

-- Skill table: stores skills associated with profiles
CREATE TABLE api_skill (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id INTEGER NOT NULL REFERENCES api_profile(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL
);

CREATE INDEX idx_skill_name ON api_skill(name);
CREATE INDEX idx_skill_profile_name ON api_skill(profile_id, name);

-- Project table: stores projects associated with profiles
CREATE TABLE api_project (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id INTEGER NOT NULL REFERENCES api_profile(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    links VARCHAR(200) DEFAULT ''
);

CREATE INDEX idx_project_title ON api_project(title);
CREATE INDEX idx_project_profile_title ON api_project(profile_id, title);

-- Work table: stores work experience associated with profiles
CREATE TABLE api_work (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    profile_id INTEGER NOT NULL REFERENCES api_profile(id) ON DELETE CASCADE,
    company VARCHAR(100) NOT NULL,
    role VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    description TEXT DEFAULT ''
);

CREATE INDEX idx_work_company ON api_work(company);
CREATE INDEX idx_work_profile_start ON api_work(profile_id, start_date);
