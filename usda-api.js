// USDA API Configuration - safe for client-side use
const USDA_CONFIG = {
    apiKey: import.meta.env.VITE_USDA_API_KEY,
    baseUrl: 'https://api.nal.usda.gov/fdc/v1',
    dataTypes: ['Foundation', 'SR Legacy', 'Survey (FNDDS)'],
    rateLimit: 100, // ms delay between requests
    defaultServings: 4
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
 * Validates API configuration
 */
function validateConfig() {
    if (!USDA_CONFIG.apiKey) {
        throw new Error('USDA API key is missing. Please set VITE_USDA_API_KEY in your environment.')
    }
}

/**
 * Search for foods by name and return matching items
 */
export async function searchFoods(query, pageSize = 5) {
    validateConfig()
    
    if (!query?.trim()) {
        return []
    }
    
    try {
        const response = await fetch(`${USDA_CONFIG.baseUrl}/foods/search?api_key=${USDA_CONFIG.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: query.trim(),
                pageSize: Math.min(pageSize, 20), // Limit page size
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
export async function getFoodDetails(fdcId) {
    validateConfig()
    
    if (!fdcId) {
        return null
    }
    
    try {
        const response = await fetch(`${USDA_CONFIG.baseUrl}/food/${fdcId}?api_key=${USDA_CONFIG.apiKey}`)
        
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
 * Get nutrition data for a list of ingredients
 */
export async function getNutritionForIngredients(ingredients) {
    const nutritionData = []
    
    for (const ingredient of ingredients) {
        const foods = await searchFoods(ingredient, 1)
        if (foods.length > 0) {
            const details = await getFoodDetails(foods[0].fdcId)
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
        // Small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, USDA_CONFIG.rateLimit))
    }
    
    return nutritionData
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
 * Calculate total nutrition for a recipe
 */
export function calculateRecipeNutrition(ingredientNutritionData, servings = USDA_CONFIG.defaultServings) {
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