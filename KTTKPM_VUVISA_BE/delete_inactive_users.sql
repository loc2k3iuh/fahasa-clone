-- SQL query to delete users created more than 10 days ago with enabled=false
DELETE FROM users
WHERE enabled = false
AND created_date < DATE_SUB(CURRENT_DATE(), INTERVAL 10 DAY);