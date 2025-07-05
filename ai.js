// import Anthropic from "@anthropic-ai/sdk"
//import { HfInference } from '@huggingface/inference'

const SYSTEM_PROMPT = `
You are an assistant that receives a list of ingredients that a user has and suggests a recipe they could make with some or all of those ingredients. You don't need to use every ingredient they mention in your recipe. The recipe can include additional ingredients they didn't mention, but try not to include too many extra ingredients. Format your response in markdown to make it easier to render to a web page
`

// API disabled for security - don't expose API keys in client-side code
/*
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
})
*/

export async function getRecipeFromChefClaude(ingredientsArr) {
    // Commented out real API call for security
    /*
    const ingredientsString = ingredientsArr.join(", ")

    const msg = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages: [
            { role: "user", content: `I have ${ingredientsString}. Please give me a recipe you'd recommend I make!` },
        ],
    });
    return msg.content[0].text
    */

    // Return fake recipe for demo purposes
    const ingredientsString = ingredientsArr.join(", ")
    
    return `# Demo Recipe for ${ingredientsString}

## Ingredients
- ${ingredientsArr.join('\n- ')}
- Salt and pepper to taste
- 2 tbsp olive oil

## Instructions
1. Heat olive oil in a large pan
2. Add your main ingredients and cook for 10-15 minutes
3. Season with salt and pepper
4. Serve hot and enjoy!

*Note: This is a demo recipe. The AI functionality has been disabled for security reasons when deploying to production.*`
}
