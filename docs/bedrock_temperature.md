# Temperature

## What is Temperature?

Temperature is a hyperparameter that controls the randomness and creativity of the AI model's responses. It influences the probability distribution of the next token the model selects.

## Why it matters:

- **Creativity**: Higher temperatures (e.g., 0.7-1.0) lead to more diverse, imaginative, and sometimes unexpected outputs.
- **Determinism**: Lower temperatures (e.g., 0.1-0.3) make the model more deterministic, producing more focused, consistent, and less varied responses.
- **Use Case Alignment**: The optimal temperature depends on your application. For creative writing, a higher temperature is good. For factual question-answering, a lower temperature is preferred.

## Common pitfalls:

- **Too low (e.g., 0.0-0.1)**: Responses can become repetitive, generic, and lack originality. The model might get "stuck" in loops.
- **Too high (e.g., 0.9-1.0)**: Responses can become incoherent, nonsensical, or completely off-topic. The model might "hallucinate" more.
- **Misalignment**: Using a high temperature for a task requiring precision (like code generation) can lead to errors.

## Related tasks:

- [Create an AI Chatbot](../recipes/bedrock_chatbot.yaml)
- [Generate Marketing Content](../recipes/bedrock_content_generation.yaml)
