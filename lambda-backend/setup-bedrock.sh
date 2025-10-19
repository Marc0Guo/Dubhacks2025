#!/bin/bash

# AWS Bedrock Setup Script for AWS Tutor
echo "🚀 Setting up AWS Bedrock integration for AWS Tutor..."

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first:"
    echo "   https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
    exit 1
fi

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS CLI is not configured. Please run 'aws configure' first."
    exit 1
fi

echo "✅ AWS CLI is configured"

# Get current AWS account ID
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
REGION="us-east-1"
LAMBDA_ROLE_NAME="aws-tutor-lambda-role"

echo "📋 Account ID: $ACCOUNT_ID"
echo "🌍 Region: $REGION"

# Create IAM policy for Bedrock
echo "📝 Creating IAM policy for Bedrock access..."
aws iam create-policy \
    --policy-name "AWS-Tutor-Bedrock-Policy" \
    --policy-document file://bedrock-policy.json \
    --description "Policy for AWS Tutor to access Amazon Bedrock" \
    --output table

# Create or update Lambda execution role
echo "🔧 Setting up Lambda execution role..."

# Check if role exists
if aws iam get-role --role-name "$LAMBDA_ROLE_NAME" &> /dev/null; then
    echo "✅ Role $LAMBDA_ROLE_NAME already exists"
else
    echo "📝 Creating Lambda execution role..."
    aws iam create-role \
        --role-name "$LAMBDA_ROLE_NAME" \
        --assume-role-policy-document '{
            "Version": "2012-10-17",
            "Statement": [
                {
                    "Effect": "Allow",
                    "Principal": {
                        "Service": "lambda.amazonaws.com"
                    },
                    "Action": "sts:AssumeRole"
                }
            ]
        }' \
        --description "Execution role for AWS Tutor Lambda function"
fi

# Attach basic Lambda execution policy
echo "🔗 Attaching basic Lambda execution policy..."
aws iam attach-role-policy \
    --role-name "$LAMBDA_ROLE_NAME" \
    --policy-arn "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"

# Attach Bedrock policy
echo "🔗 Attaching Bedrock policy..."
aws iam attach-role-policy \
    --role-name "$LAMBDA_ROLE_NAME" \
    --policy-arn "arn:aws:iam::$ACCOUNT_ID:policy/AWS-Tutor-Bedrock-Policy"

# Enable Bedrock model access (if needed)
echo "🔓 Enabling Bedrock model access..."
aws bedrock put-model-invocation-logging-configuration \
    --logging-config '{
        "textDataDeliveryEnabled": true,
        "imageDataDeliveryEnabled": false,
        "embeddingDataDeliveryEnabled": false
    }' \
    --region "$REGION" || echo "⚠️  Model access logging may already be configured"

echo ""
echo "✅ Bedrock setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Deploy your Lambda function with the role: $LAMBDA_ROLE_NAME"
echo "2. Test the integration with: npm run test-bedrock"
echo "3. Update your serverless.yml to use the role ARN:"
echo "   arn:aws:iam::$ACCOUNT_ID:role/$LAMBDA_ROLE_NAME"
echo ""
echo "🧪 Test Bedrock access:"
echo "aws bedrock list-foundation-models --region $REGION"
