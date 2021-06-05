DROP TABLE IF EXISTS users;
CREATE TABLE users (
    "UserID" serial PRIMARY KEY NOT NULL,
    "Username" varchar(255),
    "Password" varchar(255),
    "BestScore" int DEFAULT 0
);