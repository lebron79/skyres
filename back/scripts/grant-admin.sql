-- Run in MySQL Workbench or: mysql -u root skyres_db < scripts/grant-admin.sql
USE skyres_db;
UPDATE users SET role = 'ADMIN' WHERE email = 'yassinenemri@gmail.com';
