// AWS Bedrock Integration for Explain Mode
// This file handles communication with Amazon Bedrock for AI explanations

class AWSBedrockClient {
  constructor() {
    this.region = 'us-east-1'; // Default region
    this.modelId = 'anthropic.claude-3-sonnet-20240229-v1:0'; // Claude 3 Sonnet
    this.isInitialized = false;
    this.credentials = null;
  }

  async initialize() {
    try {
      // Get AWS credentials from storage or environment
      this.credentials = await this.getCredentials();
      if (!this.credentials) {
        throw new Error('AWS credentials not found. Please configure your AWS credentials.');
      }

      this.isInitialized = true;
      console.log('AWS Bedrock client initialized with region:', this.region);
      return true;
    } catch (error) {
      console.error('Failed to initialize AWS Bedrock client:', error);
      return false;
    }
  }

  async getCredentials() {
    try {
      // Try to get credentials from Chrome storage first
      const stored = await this.getStoredCredentials();
      if (stored && stored.accessKeyId && stored.secretAccessKey) {
        return stored;
      }

      // Fallback to environment variables (for development)
      if (typeof process !== 'undefined' && process.env) {
        const envCreds = {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
          region: process.env.AWS_REGION || this.region
        };

        if (envCreds.accessKeyId && envCreds.secretAccessKey) {
          return envCreds;
        }
      }

      return null;
    } catch (error) {
      console.error('Error getting credentials:', error);
      return null;
    }
  }

  async getStoredCredentials() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['awsCredentials'], (result) => {
        resolve(result.awsCredentials || null);
      });
    });
  }

  async setCredentials(credentials) {
    this.credentials = credentials;
    return new Promise((resolve) => {
      chrome.storage.local.set({ awsCredentials: credentials }, () => {
        resolve();
      });
    });
  }

  async explainElement(elementData) {
    if (!this.isInitialized) {
      const initialized = await this.initialize();
      if (!initialized) {
        throw new Error('AWS Bedrock client not initialized');
      }
    }

    try {
      const prompt = this.buildPrompt(elementData);
      const response = await this.callBedrockAPI(prompt);
      return this.parseResponse(response);
    } catch (error) {
      console.error('Error explaining element:', error);
      throw error;
    }
  }

  buildPrompt(elementData) {
    const { element, context, pageUrl } = elementData;

    return `You are an AWS expert assistant. Analyze the following AWS Console element and provide a clear, helpful explanation.

Element Information:
- Tag: ${element.tagName}
- Text: ${element.textContent?.trim() || 'No text'}
- Classes: ${element.className || 'No classes'}
- ID: ${element.id || 'No ID'}
- Attributes: ${this.getElementAttributes(element)}
- Context: ${context}
- Page URL: ${pageUrl}

Please provide:
1. What this element does
2. How to use it
3. Best practices
4. Common use cases

Keep the explanation concise but informative, suitable for AWS Console users.`;
  }

  getElementAttributes(element) {
    const attributes = [];
    for (let attr of element.attributes) {
      attributes.push(`${attr.name}="${attr.value}"`);
    }
    return attributes.join(', ');
  }

  async callBedrockAPI(prompt) {
    try {
      const endpoint = `https://bedrock-runtime.${this.region}.amazonaws.com/model/${this.modelId}/invoke`;

      const requestBody = {
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 1000,
        temperature: 0.7,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      };

      // Create AWS signature
      const signedRequest = await this.createSignedRequest(endpoint, requestBody);

      const response = await fetch(endpoint, signedRequest);

      if (!response.ok) {
        throw new Error(`Bedrock API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error('Error calling Bedrock API:', error);
      throw error;
    }
  }

  async createSignedRequest(endpoint, body) {
    const url = new URL(endpoint);
    const method = 'POST';
    const service = 'bedrock';
    const host = url.hostname;
    const region = this.region;
    const contentType = 'application/json';

    // Create canonical request
    const canonicalUri = url.pathname;
    const canonicalQueryString = url.search.substring(1);
    const hashedPayload = await this.sha256(JSON.stringify(body));

    const canonicalHeaders = [
      `content-type:${contentType}`,
      `host:${host}`,
      `x-amz-date:${this.getAmzDate()}`
    ].join('\n') + '\n';

    const signedHeaders = 'content-type;host;x-amz-date';
    const canonicalRequest = [
      method,
      canonicalUri,
      canonicalQueryString,
      canonicalHeaders,
      signedHeaders,
      hashedPayload
    ].join('\n');

    // Create string to sign
    const algorithm = 'AWS4-HMAC-SHA256';
    const credentialScope = `${this.getDateStamp()}/${region}/${service}/aws4_request`;
    const stringToSign = [
      algorithm,
      this.getAmzDate(),
      credentialScope,
      await this.sha256(canonicalRequest)
    ].join('\n');

    // Calculate signature
    const signature = await this.calculateSignature(stringToSign, region, service);

    // Create authorization header
    const authorization = `${algorithm} Credential=${this.credentials.accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

    return {
      method: method,
      headers: {
        'Content-Type': contentType,
        'Authorization': authorization,
        'X-Amz-Date': this.getAmzDate(),
        'X-Amz-Content-Sha256': hashedPayload
      },
      body: JSON.stringify(body)
    };
  }

  async sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async hmacSha256(key, message) {
    const keyBuffer = typeof key === 'string' ? new TextEncoder().encode(key) : key;
    const messageBuffer = new TextEncoder().encode(message);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyBuffer,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageBuffer);
    return new Uint8Array(signature);
  }

  async calculateSignature(stringToSign, region, service) {
    const dateKey = await this.hmacSha256(`AWS4${this.credentials.secretAccessKey}`, this.getDateStamp());
    const dateRegionKey = await this.hmacSha256(dateKey, region);
    const dateRegionServiceKey = await this.hmacSha256(dateRegionKey, service);
    const signingKey = await this.hmacSha256(dateRegionServiceKey, 'aws4_request');

    const signature = await this.hmacSha256(signingKey, stringToSign);
    return Array.from(signature).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  getAmzDate() {
    return new Date().toISOString().replace(/[:\-]|\.\d{3}/g, '');
  }

  getDateStamp() {
    return new Date().toISOString().substring(0, 10).replace(/-/g, '');
  }

  guessElementPurpose(prompt) {
    // Simple heuristic to guess element purpose based on text content
    const text = prompt.toLowerCase();

    if (text.includes('launch') && text.includes('instance')) {
      return 'launching EC2 instances';
    } else if (text.includes('bucket') && text.includes('create')) {
      return 'creating S3 buckets';
    } else if (text.includes('database') && text.includes('create')) {
      return 'creating database instances';
    } else if (text.includes('function') && text.includes('create')) {
      return 'creating Lambda functions';
    } else if (text.includes('button') || text.includes('btn')) {
      return 'performing actions in the AWS Console';
    } else if (text.includes('input') || text.includes('text')) {
      return 'entering configuration values';
    } else {
      return 'interacting with AWS services';
    }
  }

  parseResponse(response) {
    try {
      // Handle Claude 3 response format
      if (response.content && Array.isArray(response.content)) {
        const textContent = response.content.find(item => item.type === 'text');
        if (textContent && textContent.text) {
          return textContent.text;
        }
      }

      // Fallback: try to extract text from any content
      if (response.content && response.content[0] && response.content[0].text) {
        return response.content[0].text;
      }

      // If no content found, return error message
      return 'Unable to generate explanation at this time. Please try again.';
    } catch (error) {
      console.error('Error parsing Bedrock response:', error);
      return 'Error processing AI response. Please check your AWS credentials and try again.';
    }
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AWSBedrockClient;
} else {
  window.AWSBedrockClient = AWSBedrockClient;
}
