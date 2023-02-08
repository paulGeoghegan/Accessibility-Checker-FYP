DROP DATABASE IF EXISTS WebAccessabilityChecker;
CREATE DATABASE WebAccessabilityChecker;

\c WebAccessabilityChecker;

CREATE TABLE users (
	id SERIAL PRIMARY KEY,
	email VARCHAR,
	password VARCHAR
);
