\c messagely

DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS messages;

CREATE TABLE users (
    username text PRIMARY KEY,
    password text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    phone text NOT NULL,
    join_at timestamp without time zone NOT NULL,
    last_login_at timestamp with time zone
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    from_username text NOT NULL REFERENCES users,
    to_username text NOT NULL REFERENCES users,
    body text NOT NULL,
    sent_at timestamp with time zone NOT NULL,
    read_at timestamp with time zone
);

INSERT INTO users
    VALUES ('test1', 'testpwd', 'test1', 'lname', 1234567890, '2018-01-01'),
           ('test2', 'testpwd', 'test2', 'lname', 1234567890, '2018-01-01'),
           ('test3', 'testpwd', 'test3', 'lname', 1234567890, '2018-01-01');

INSERT INTO messages (from_username, to_username, body, sent_at, read_at)
    VALUES ('test1', 'test2', 'test1 --> test2', '2018-01-01', '2018-12-31'),
           ('test1', 'test3', 'test1 --> test3', '2018-01-01', '2018-12-31');