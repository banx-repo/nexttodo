# Hướng dẫn sử dụng trước khi dùng

1. MySQL

`docker run --name nexttodo -e MYSQL_ROOT_PASSWORD=bnx -p 3306:3306 -d mysql:5`

2. Tạo cơ sở dữ liệu

```sql
CREATE DATABASE IF NOT EXISTS todolist
CHARACTER SET utf8;
```

3. Tạo bảng

```sql
CREATE TABLE IF NOT EXISTS user (
id INT auto_increment PRIMARY KEY,
fullname VARCHAR(255) NOT NULL,
username VARCHAR(10) NOT NULL,
password VARCHAR(255) NOT NULL,
avatar TEXT,
created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
```

```sql
CREATE TABLE IF NOT EXISTS todo (
id INT AUTO_INCREMENT PRIMARY KEY,
content TEXT NOT NULL,
created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
completed TINYINT(1) DEFAULT 0,
user_id INT,
FOREIGN KEY (user_id) REFERENCES user (id));
```

4. Run

`npm run dev`
