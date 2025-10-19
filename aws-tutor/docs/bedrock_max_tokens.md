# Max Tokens Parameter

## What is Max Tokens?

Max tokens sets the maximum length of the AI response in tokens. 1 token is approximately 0.75 words in English, so this directly controls how long your responses can be.

## Why it matters

- **Prevents runaway costs**: Each token costs money
- **Ensures appropriate length**: Responses fit your application's needs
- **Controls response quality**: Too short = cut off, too long = rambling

## Common settings

- **Chatbots**: 1000-2000 tokens (750-1500 words)
- **Articles**: 2000-4000 tokens (1500-3000 words)
- **Code snippets**: 500-1000 tokens (375-750 words)
- **Quick answers**: 200-500 tokens (150-375 words)

## Pitfalls to avoid

- **Too low**: Responses get cut off mid-sentence
- **Too high**: Wastes money on unused token capacity
- **Not considering input length**: Total cost = input + output tokens

## Cost calculation

**Claude 3.5 Sonnet pricing:**

- Input: $3.00 per 1M tokens
- Output: $15.00 per 1M tokens

**Example:**

- Input: 100 tokens = $0.0003
- Output: 1000 tokens = $0.015
- Total: $0.0153 per request

## Best practices

1. **Start conservative**: Use lower limits initially
2. **Monitor usage**: Track actual token usage
3. **Adjust based on needs**: Increase if responses are cut off
4. **Consider input length**: Factor in prompt length
5. **Set up alerts**: Monitor costs and usage

## Token counting tips

- Use online token counters for estimation
- Test with sample prompts to measure usage
- Remember that different models have different token limits
- Consider that longer prompts = higher input costs
