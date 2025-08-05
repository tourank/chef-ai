// Nutrition display configuration
export const NUTRITION_DISPLAY_CONFIG = [
    { key: 'calories', label: 'Calories', priority: 1, unit: 'kcal' },
    { key: 'protein', label: 'Protein', priority: 1, unit: 'g' },
    { key: 'carbs', label: 'Carbs', priority: 1, unit: 'g' },
    { key: 'fat', label: 'Fat', priority: 1, unit: 'g' },
    { key: 'fiber', label: 'Fiber', priority: 2, unit: 'g' },
    { key: 'sodium', label: 'Sodium', priority: 2, unit: 'mg' },
    { key: 'sugars', label: 'Sugars', priority: 3, unit: 'g' },
    { key: 'calcium', label: 'Calcium', priority: 3, unit: 'mg' },
    { key: 'iron', label: 'Iron', priority: 3, unit: 'mg' },
    { key: 'potassium', label: 'Potassium', priority: 3, unit: 'mg' },
    { key: 'vitaminA', label: 'Vitamin A', priority: 3, unit: 'μg' },
    { key: 'vitaminC', label: 'Vitamin C', priority: 3, unit: 'mg' }
]

/**
 * Filters nutrients to only show those with valid data
 */
export function getAvailableNutrients(nutritionData) {
    if (!nutritionData?.perServing) {
        return []
    }

    return NUTRITION_DISPLAY_CONFIG
        .filter(nutrient => {
            const data = nutritionData.perServing[nutrient.key]
            return data && !isNaN(data.amount) && data.amount !== null && data.amount !== undefined
        })
        .sort((a, b) => a.priority - b.priority)
}