// AWS Bedrock Settings Page
console.log('AWS Bedrock Settings page loaded');

// DOM elements
const form = document.getElementById('settingsForm');
const saveBtn = document.getElementById('saveBtn');
const clearBtn = document.getElementById('clearBtn');
const testBtn = document.getElementById('testBtn');
const status = document.getElementById('status');
const testStatus = document.getElementById('testStatus');

// Load saved settings
function loadSettings() {
    chrome.storage.local.get(['awsAccessKey', 'awsSecretKey', 'awsRegion'], (result) => {
        if (result.awsAccessKey) {
            document.getElementById('awsAccessKey').value = result.awsAccessKey;
        }
        if (result.awsSecretKey) {
            document.getElementById('awsSecretKey').value = result.awsSecretKey;
        }
        if (result.awsRegion) {
            document.getElementById('awsRegion').value = result.awsRegion;
        }
    });
}

// Save settings
function saveSettings() {
    const accessKey = document.getElementById('awsAccessKey').value.trim();
    const secretKey = document.getElementById('awsSecretKey').value.trim();
    const region = document.getElementById('awsRegion').value;

    if (!accessKey || !secretKey) {
        showStatus('Please fill in all required fields', 'error');
        return;
    }

    // Validate access key format
    if (!accessKey.startsWith('AKIA') || accessKey.length !== 20) {
        showStatus('Invalid AWS Access Key format. Should start with AKIA and be 20 characters long.', 'error');
        return;
    }

    // Validate secret key format
    if (secretKey.length < 40) {
        showStatus('Invalid AWS Secret Key format. Should be at least 40 characters long.', 'error');
        return;
    }

    chrome.storage.local.set({
        awsAccessKey: accessKey,
        awsSecretKey: secretKey,
        awsRegion: region
    }, () => {
        if (chrome.runtime.lastError) {
            showStatus('Error saving settings: ' + chrome.runtime.lastError.message, 'error');
        } else {
            showStatus('Settings saved successfully!', 'success');
        }
    });
}

// Clear settings
function clearSettings() {
    if (confirm('Are you sure you want to clear all AWS credentials? This will disable Bedrock analysis.')) {
        chrome.storage.local.remove(['awsAccessKey', 'awsSecretKey', 'awsRegion'], () => {
            document.getElementById('awsAccessKey').value = '';
            document.getElementById('awsSecretKey').value = '';
            document.getElementById('awsRegion').value = 'us-west-2';
            showStatus('Settings cleared successfully!', 'success');
        });
    }
}

// Test Bedrock connection
function testConnection() {
    const accessKey = document.getElementById('awsAccessKey').value.trim();
    const secretKey = document.getElementById('awsSecretKey').value.trim();
    const region = document.getElementById('awsRegion').value;

    if (!accessKey || !secretKey) {
        showTestStatus('Please save your credentials first', 'error');
        return;
    }

    testBtn.disabled = true;
    testBtn.textContent = 'Testing...';
    showTestStatus('Testing Bedrock connection...', 'info');

    // Send test request to background script
    chrome.runtime.sendMessage({
        action: 'testBedrockConnection',
        credentials: {
            accessKeyId: accessKey,
            secretAccessKey: secretKey,
            region: region
        }
    }, (response) => {
        testBtn.disabled = false;
        testBtn.textContent = 'Test Bedrock Connection';

        if (chrome.runtime.lastError) {
            showTestStatus('Error: ' + chrome.runtime.lastError.message, 'error');
            return;
        }

        if (response && response.success) {
            showTestStatus('✅ Bedrock connection successful! You can now use element analysis.', 'success');
        } else {
            showTestStatus('❌ Bedrock connection failed: ' + (response.error || 'Unknown error'), 'error');
        }
    });
}

// Show status message
function showStatus(message, type) {
    status.textContent = message;
    status.className = `status ${type}`;
    status.style.display = 'block';

    setTimeout(() => {
        status.style.display = 'none';
    }, 5000);
}

// Show test status message
function showTestStatus(message, type) {
    testStatus.textContent = message;
    testStatus.className = `status ${type}`;
    testStatus.style.display = 'block';

    if (type === 'success') {
        setTimeout(() => {
            testStatus.style.display = 'none';
        }, 10000);
    }
}

// Event listeners
saveBtn.addEventListener('click', saveSettings);
clearBtn.addEventListener('click', clearSettings);
testBtn.addEventListener('click', testConnection);

// Load settings on page load
document.addEventListener('DOMContentLoaded', loadSettings);

// Prevent form submission
form.addEventListener('submit', (e) => {
    e.preventDefault();
    saveSettings();
});
