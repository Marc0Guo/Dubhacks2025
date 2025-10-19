// Debug script to test AWS SDK loading in service worker
console.log('Debug script loaded');

// Test AWS SDK loading
try {
    importScripts('aws-sdk.min.js');
    console.log('✅ AWS SDK loaded successfully');

    // Test AWS object availability
    if (typeof AWS !== 'undefined') {
        console.log('✅ AWS object is available');
        console.log('AWS version:', AWS.VERSION);
        console.log('Available services:', Object.keys(AWS));

        // Test BedrockRuntime availability
        if (AWS.BedrockRuntime) {
            console.log('✅ BedrockRuntime service is available');
        } else {
            console.log('❌ BedrockRuntime service not available');
        }
    } else {
        console.log('❌ AWS object not available');
    }
} catch (error) {
    console.error('❌ Failed to load AWS SDK:', error);
}
