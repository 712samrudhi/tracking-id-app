-- MLA Sales Tracker - Database Schema
-- Import this file via Hostinger hPanel > phpMyAdmin

CREATE TABLE IF NOT EXISTS employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id VARCHAR(20) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  mobile VARCHAR(15) NOT NULL,
  area VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  role ENUM('sales','manager') NOT NULL DEFAULT 'sales',
  password VARCHAR(255) NOT NULL,
  security_q1 VARCHAR(255), security_a1 VARCHAR(255),
  security_q2 VARCHAR(255), security_a2 VARCHAR(255),
  security_q3 VARCHAR(255), security_a3 VARCHAR(255),
  security_q4 VARCHAR(255), security_a4 VARCHAR(255),
  security_q5 VARCHAR(255), security_a5 VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS km_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id VARCHAR(20) NOT NULL,
  log_date DATE NOT NULL,
  log_month VARCHAR(7) NOT NULL, -- format YYYY-MM
  daily_km DECIMAL(10,2) NOT NULL,     -- calculated automatically from GPS tracking
  payment DECIMAL(10,2) NOT NULL,
  start_lat DECIMAL(10,7),             -- optional: where tracking started
  start_lng DECIMAL(10,7),
  end_lat DECIMAL(10,7),               -- optional: where tracking ended
  end_lng DECIMAL(10,7),
  route_points LONGTEXT,               -- optional: JSON array of [lat,lng] points for the route
  started_at DATETIME,
  ended_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX (employee_id, log_month)
);

CREATE TABLE IF NOT EXISTS client_visits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id VARCHAR(20) NOT NULL,
  client_name VARCHAR(150) NOT NULL,
  mobile VARCHAR(15) NOT NULL,
  shop_name VARCHAR(150) NOT NULL,
  remark TEXT,
  order_taken TINYINT(1) DEFAULT 0,
  visit_date DATE NOT NULL,
  visit_month VARCHAR(7) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX (employee_id, visit_month)
);

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  employee_id VARCHAR(20) NOT NULL,
  visit_id INT,
  client_name VARCHAR(150) NOT NULL,
  shop_name VARCHAR(150) NOT NULL,
  mobile VARCHAR(15),
  order_details TEXT NOT NULL,
  order_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_received DECIMAL(10,2) NOT NULL DEFAULT 0,
  pending_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_status ENUM('Paid','Pending') NOT NULL DEFAULT 'Pending',
  order_date DATE NOT NULL,
  order_month VARCHAR(7) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (visit_id) REFERENCES client_visits(id) ON DELETE SET NULL,
  INDEX (employee_id, payment_status)
);
