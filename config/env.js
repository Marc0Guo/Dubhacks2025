// AWS Tutor Configuration
export const API_BASE = "https://api.thishurtyougave.select";

// API endpoints
export const ENDPOINTS = {
  HEALTH: `${API_BASE}/health`,
  PLAN: `${API_BASE}/plan`,
  EXPLAIN_ELEMENT: `${API_BASE}/explain-element`,
  ERROR_HELP: `${API_BASE}/error-help`
};

// Service types
export const SERVICES = {
  BEDROCK: "bedrock",
  EC2: "ec2",
  S3: "s3",
  LAMBDA: "lambda",
  RDS: "rds"
};

// Default request options
export const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  "Accept": "application/json"
};

// Timeout settings
export const TIMEOUTS = {
  DEFAULT: 10000, // 10 seconds
  HEALTH_CHECK: 5000, // 5 seconds
  EXPLAIN: 15000 // 15 seconds for AI explanations
};
