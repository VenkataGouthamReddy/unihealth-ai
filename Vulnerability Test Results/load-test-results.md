# Baseline Load Test Results

**Date Executed:** 2026-07-31
**Target API:** `http://127.0.0.1:8000/public/stats` (Local Database Environment)
**Virtual Users:** 100
**Duration:** 60 seconds

---

## Test Execution Summary
- **Total Requests Completed:** 12,078
- **Total Errors:** 0 (100% Success Rate)
- **Actual Duration:** 60.59 seconds

---

## Performance Metrics

### Requests per second (RPS)
**199.33 req/sec**
*(The API comfortably handled nearly 200 requests every second without crashing or dropping connections).*

### Response Time
- **Average:** 499.37ms
- **Min (Fastest):** 40.89ms
- **Max (Slowest):** 866.86ms

---

## Conclusion
The backend application successfully passed the baseline load testing requirements. Under a sustained load of 100 concurrent virtual users, the system maintained a 0% error rate and kept response times fast and consistent.
