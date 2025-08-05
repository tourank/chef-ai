// USDA API Configuration
const USDA_CONFIG = {
    baseUrl: 'https://api.nal.usda.gov/fdc/v1',
    dataTypes: ['Foundation', 'SR Legacy', 'Survey (FNDDS)'],
    rateLimit: 100
}

// Nutrient ID mapping for USDA database
const NUTRIENT_MAP = {
    1008: 'calories', // Energy (kcal)
    1003: 'protein', // Protein (g)
    1004: 'fat', // Total lipid (fat) (g)
    1005: 'carbs', // Carbohydrate, by difference (g)
    1079: 'fiber', // Fiber, total dietary (g)
    2000: 'sugars', // Sugars, total including NLEA (g)
    1093: 'sodium', // Sodium, Na (mg)
    1092: 'potassium', // Potassium, K (mg)
    1087: 'calcium', // Calcium, Ca (mg)
    1089: 'iron', // Iron, Fe (mg)
    1106: 'vitaminA', // Vitamin A, RAE (μg)
    1162: 'vitaminC' // Vitamin C, total ascorbic acid (mg)
}

/**
 * Validates that a nutrient value is usable
 */
function isValidNutrientValue(amount) {
    return amount !== undefined && amount !== null && !isNaN(amount) && amount >= 0
}

/**
 * Extract key nutrients from USDA food details
 */
function extractKeyNutrients(foodDetails) {
    const nutrients = {}

    if (!foodDetails?.foodNutrients) {
        return nutrients
    }

    foodDetails.foodNutrients.forEach(nutrient => {
        const nutrientId = nutrient.nutrient?.id || nutrient.nutrientId
        const key = NUTRIENT_MAP[nutrientId]
        
        if (key) {
            const amount = nutrient.amount ?? nutrient.value
            const unit = nutrient.nutrient?.unitName || nutrient.unitName
            
            if (isValidNutrientValue(amount) && unit) {
                nutrients[key] = { amount, unit }
            }
        }
    })

    return nutrients
}

/**
 * Search for foods by name
 */
async function searchFoods(query, apiKey, pageSize = 1) {
    if (!query?.trim()) {
        return []
    }
    
    try {
        const response = await fetch(`${USDA_CONFIG.baseUrl}/foods/search?api_key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: query.trim(),
                pageSize: Math.min(pageSize, 20),
                dataType: USDA_CONFIG.dataTypes
            })
        })

        if (!response.ok) {
            throw new Error(`USDA API error: ${response.status}`)
        }

        const data = await response.json()
        return data.foods || []
    } catch (error) {
        console.error('Error searching foods:', error)
        return []
    }
}

/**
 * Get detailed nutrition information for a specific food item
 */
async function getFoodDetails(fdcId, apiKey) {
    if (!fdcId) {
        return null
    }
    
    try {
        const response = await fetch(`${USDA_CONFIG.baseUrl}/food/${fdcId}?api_key=${apiKey}`)
        
        if (!response.ok) {
            throw new Error(`USDA API error: ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        console.error('Error fetching food details:', error)
        return null
    }
}

/**
 * Calculate total nutrition for a recipe
 */
function calculateRecipeNutrition(ingredientNutritionData, servings = 4) {
    const totals = {}
    
    ingredientNutritionData.forEach(ingredient => {
        Object.entries(ingredient.nutrients).forEach(([nutrient, data]) => {
            if (!totals[nutrient]) {
                totals[nutrient] = { amount: 0, unit: data.unit }
            }
            totals[nutrient].amount += data.amount
        })
    })
    
    // Calculate per serving
    const perServing = {}
    Object.entries(totals).forEach(([nutrient, data]) => {
        perServing[nutrient] = {
            amount: Math.round((data.amount / servings) * 10) / 10,
            unit: data.unit
        }
    })
    
    return { totals, perServing, servings }
}

/**
 * Netlify function handler
 */
export async function handler(event, context) {
    // Validate API key
    const apiKey = process.env.USDA_API_KEY
    if (!apiKey) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'USDA API key not configured' })
        }
    }

    // Parse request
    const { ingredients } = JSON.parse(event.body)
    if (!ingredients || !Array.isArray(ingredients)) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid ingredients array' })
        }
    }

    try {
        const nutritionData = []
        
        // Process each ingredient
        for (const ingredient of ingredients) {
            const foods = await searchFoods(ingredient, apiKey, 1)
            if (foods.length > 0) {
                const details = await getFoodDetails(foods[0].fdcId, apiKey)
                if (details) {
                    const nutrients = extractKeyNutrients(details)
                    nutritionData.push({
                        ingredient,
                        fdcId: foods[0].fdcId,
                        description: foods[0].description,
                        nutrients
                    })
                }
            }
            // Rate limiting delay
            await new Promise(resolve => setTimeout(resolve, USDA_CONFIG.rateLimit))
        }
        
        // Calculate recipe nutrition
        const recipeNutrition = nutritionData.length > 0 
            ? calculateRecipeNutrition(nutritionData)
            : null

        return {
            statusCode: 200,
            body: JSON.stringify({ nutrition: recipeNutrition })
        }
        
    } catch (error) {
        console.error('Error processing nutrition request:', error)
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch nutrition data' })
        }
    }
}