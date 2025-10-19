// AWS Bedrock Integration for Explain Mode
// This file handles communication with Amazon Bedrock for AI explanations

class AWSBedrockClient {
  constructor() {
    this.region = 'us-east-1'; // Default region
    this.modelId = 'anthropic.claude-3-sonnet-20240229-v1:0'; // Claude 3 Sonnet
    this.isInitialized = false;
  }

  async initialize() {
    try {
      // Check if AWS credentials are available
      const credentials = await this.getCredentials();
      if (!credentials) {
        throw new Error('AWS credentials not found');
      }

      this.isInitialized = true;
      console.log('AWS Bedrock client initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize AWS Bedrock client:', error);
      return false;
    }
  }

  async getCredentials() {
    // In a real implementation, this would get AWS credentials
    // For now, we'll use a placeholder that would need to be configured
    return {
      accessKeyId: 'YOUR_ACCESS_KEY',
      secretAccessKey: 'YOUR_SECRET_KEY',
      region: this.region
    };
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
    // This is a placeholder for the actual Bedrock API call
    // In a real implementation, you would use the AWS SDK for JavaScript

    // For now, return a mock response
    return {
      content: [{
        text: `This appears to be an AWS Console element. Based on the context and attributes, this element is likely used for ${this.guessElementPurpose(prompt)}.

Key points:
• This is a standard AWS Console interface element
• It follows AWS design patterns and conventions
• Use it according to AWS best practices
• Refer to AWS documentation for detailed usage

Best practices:
• Always review AWS documentation before making changes
• Test in a non-production environment first
• Follow the principle of least privilege
• Monitor your AWS resources regularly`
      }]
    };
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
      if (response.content && response.content[0] && response.content[0].text) {
        return response.content[0].text;
      }
      return 'Unable to generate explanation at this time.';
    } catch (error) {
      console.error('Error parsing Bedrock response:', error);
      return 'Error processing AI response.';
    }
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AWSBedrockClient;
} else {
  window.AWSBedrockClient = AWSBedrockClient;
}
