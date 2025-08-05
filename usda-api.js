// Configuration for nutrition API
const NUTRITION_CONFIG = {
    endpoint: '/.netlify/functions/nutrition'
}

/**
 * Get nutrition data for a list of ingredients via secure backend
 */
export async function getNutritionForIngredients(ingredients) {
    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
        return null
    }
    
    try {
        const response = await fetch(NUTRITION_CONFIG.endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ ingredients })
        })

        if (!response.ok) {
            throw new Error(`Nutrition API error: ${response.status}`)
        }

        const data = await response.json()
        return data.nutrition
    } catch (error) {
        console.error('Error fetching nutrition data:', error)
        return null
    }
}