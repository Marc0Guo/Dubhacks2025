// Simple test to check AWS SDK loading
console.log('Testing AWS SDK loading...');

try {
  importScripts('aws-sdk.min.js');
  console.log('✅ AWS SDK loaded successfully');

  if (typeof AWS !== 'undefined') {
    console.log('✅ AWS object is available');
    console.log('AWS version:', AWS.VERSION);

    // Test if BedrockRuntime is available
    if (AWS.BedrockRuntime) {
      console.log('✅ BedrockRuntime service is available');
    } else {
      console.log('❌ BedrockRuntime service not available');
      console.log('Available services:', Object.keys(AWS).filter(key => key.includes('Bedrock')));
    }
  } else {
    console.log('❌ AWS object not available');
  }
} catch (error) {
  console.error('❌ Failed to load AWS SDK:', error);
}
