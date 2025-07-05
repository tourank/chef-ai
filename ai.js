export async function getRecipeFromChefClaude(ingredientsArr) {

  const response = await fetch('/.netlify/functions/recipe', {
      method: 'POST',
      body: JSON.stringify({ ingredients: ingredientsArr })
  })
  const data = await response.json()
  return data.recipe
}

