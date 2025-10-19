# AWS Tutor - Deployment Guide

## Overview

This guide covers deploying the AWS Tutor Bedrock Edition backend to AWS Lambda and the Cloudflare Worker proxy.

## Prerequisites

1. **AWS CLI** configured with appropriate permissions
2. **Node.js** 18+ installed
3. **Cloudflare Wrangler CLI** installed
4. **Serverless Framework** (optional, for easier deployment)

## Backend Deployment (AWS Lambda)

### Option 1: Using Serverless Framework (Recommended)

1. **Install Serverless Framework:**

   ```bash
   npm install -g serverless
   ```

2. **Create serverless.yml:**

   ```yaml
   service: aws-tutor-backend

   provider:
     name: aws
     runtime: nodejs18.x
     region: us-east-1
     stage: ${opt:stage, 'dev'}
     environment:
       NODE_ENV: ${self:provider.stage}

   functions:
     api:
       handler: index.handler
       events:
         - http:
             path: /{proxy+}
             method: ANY
             cors: true
         - http:
             path: /
             method: ANY
             cors: true

   package:
     patterns:
       - "!node_modules/**"
       - "!test/**"
       - "!docs/**"
   ```

3. **Deploy:**
   ```bash
   cd backend
   npm install
   serverless deploy
   ```

### Option 2: Manual Lambda Deployment

1. **Install dependencies:**

   ```bash
   cd backend
   npm install
   ```

2. **Create deployment package:**

   ```bash
   zip -r aws-tutor-backend.zip . -x "*.git*" "*.md" "test/*"
   ```

3. **Upload to Lambda:**

   - Go to AWS Lambda Console
   - Create new function or update existing
   - Upload the zip file
   - Set handler to `index.handler`
   - Set runtime to Node.js 18.x

4. **Configure API Gateway:**
   - Create new API Gateway
   - Create resource with `{proxy+}` path
   - Create ANY method
   - Set integration type to Lambda Function
   - Enable CORS

## Cloudflare Worker Deployment

1. **Install Wrangler:**

   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare:**

   ```bash
   wrangler login
   ```

3. **Update API_BASE in worker.js:**

   ```javascript
   const API_BASE =
     "https://YOUR-API-GATEWAY-URL.execute-api.us-east-1.amazonaws.com/default";
   ```

4. **Deploy:**
   ```bash
   cd cloudflare
   wrangler deploy
   ```

## Testing Deployment

1. **Test API Gateway directly:**

   ```bash
   curl https://YOUR-API-GATEWAY-URL.execute-api.us-east-1.amazonaws.com/default/health
   ```

2. **Test through Cloudflare Worker:**

   ```bash
   curl https://api.thishurtyougave.select/health
   ```

3. **Run full test suite:**
   ```bash
   ./test-api.sh
   ```

## Environment Variables

### Lambda Environment Variables

- `NODE_ENV`: production
- `API_BASE`: https://api.thishurtyougave.select

### Cloudflare Worker Variables

- `API_BASE`: Your Lambda API Gateway URL

## Monitoring

1. **CloudWatch Logs:** Monitor Lambda execution logs
2. **Cloudflare Analytics:** Monitor Worker performance
3. **API Gateway Metrics:** Monitor API usage and errors

## Troubleshooting

### Common Issues

1. **CORS Errors:**

   - Ensure API Gateway has CORS enabled
   - Check Cloudflare Worker CORS headers

2. **Lambda Timeout:**

   - Increase Lambda timeout to 30 seconds
   - Check function memory allocation

3. **API Gateway 502:**

   - Check Lambda function logs
   - Verify integration configuration

4. **Cloudflare Worker 502:**
   - Check API Gateway URL in worker.js
   - Verify Lambda function is deployed

### Debug Commands

```bash
# Check Lambda logs
aws logs tail /aws/lambda/aws-tutor-backend-dev-api --follow

# Test API Gateway
curl -v https://YOUR-API-GATEWAY-URL/health

# Test Cloudflare Worker
curl -v https://api.thishurtyougave.select/health
```

## Security Considerations

1. **API Gateway:**

   - Enable API key authentication if needed
   - Set up rate limiting
   - Use HTTPS only

2. **Lambda:**

   - Use least privilege IAM roles
   - Enable VPC if needed
   - Set up CloudTrail logging

3. **Cloudflare Worker:**
   - Validate input data
   - Set appropriate CORS policies
   - Monitor for abuse

## Cost Optimization

1. **Lambda:**

   - Use appropriate memory allocation
   - Set up CloudWatch alarms for costs
   - Consider provisioned concurrency for high traffic

2. **API Gateway:**

   - Use caching where appropriate
   - Monitor usage patterns

3. **Cloudflare Worker:**
   - Monitor request volume
   - Use caching for static responses
