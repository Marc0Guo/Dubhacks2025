# AWS Tutor - Testing Suite

This folder contains all testing scripts and utilities for the AWS Tutor project.

## 🧪 Available Tests

### `run-all-tests.js`

**Comprehensive testing suite that runs all tests**

```bash
node testing/run-all-tests.js
```

Runs all tests and provides a complete status report.

### `check-config.js`

**Configuration validation**

```bash
node testing/check-config.js
```

Validates environment configuration and shows what's set up.

### `demo-integration.js`

**Integration testing**

```bash
node testing/demo-integration.js
```

Tests both Lambda backend and Python agent working together.

### `test-both-systems.js`

**Individual system testing**

```bash
node testing/test-both-systems.js
```

Tests individual system components and API endpoints.

## 🚀 Quick Testing

### Run All Tests

```bash
# From project root
node testing/run-all-tests.js

# Or make it executable and run directly
chmod +x testing/run-all-tests.js
./testing/run-all-tests.js
```

### Run Individual Tests

```bash
# Check configuration
node testing/check-config.js

# Test integration
node testing/demo-integration.js

# Test both systems
node testing/test-both-systems.js
```

## 📊 Test Results

### Expected Output

- ✅ **Configuration Check**: Validates .env file and settings
- ✅ **Integration Test**: Tests both backends working together
- ✅ **Both Systems Test**: Tests individual components

### Troubleshooting

If tests fail:

1. Check that both backends are running
2. Verify .env file is configured correctly
3. Check network connectivity
4. Review error messages in test output

## 🔧 Test Requirements

### Prerequisites

- Both backends must be running
- .env file must be configured
- Network connectivity to backends

### Starting Backends

```bash
# Quick start
./quick-start.sh

# Or manually
cd lambda-backend && npm run offline  # Terminal 1
cd python-agent && python3 start-agent.py  # Terminal 2
```

## 📝 Adding New Tests

To add a new test:

1. Create your test file in this folder
2. Add it to the `tests` array in `run-all-tests.js`
3. Follow the existing naming convention
4. Include proper error handling

## 🎯 Test Coverage

- **Configuration**: Environment variables, API keys, settings
- **Integration**: Both backends working together
- **API Endpoints**: Health checks, functionality tests
- **Error Handling**: Fallback mechanisms, error responses
- **Performance**: Response times, system status
