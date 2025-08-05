// Constants
const FAVORITES_KEY = 'chefAiFavorites'

/**
 * Generate a unique ID for a recipe based on its content
 */
export function generateRecipeId(recipe) {
    return btoa(recipe.slice(0, 100)).replace(/[^a-zA-Z0-9]/g, '').slice(0, 20)
}

/**
 * Get all favorites from localStorage
 */
export function getFavorites() {
    try {
        return JSON.parse(localStorage.getItem(FAVORITES_KEY) || '[]')
    } catch (error) {
        console.error('Error reading favorites from localStorage:', error)
        return []
    }
}

/**
 * Save favorites to localStorage
 */
export function saveFavorites(favorites) {
    try {
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites))
    } catch (error) {
        console.error('Error saving favorites to localStorage:', error)
    }
}

/**
 * Check if a recipe is favorited
 */
export function isRecipeFavorited(recipeId) {
    const favorites = getFavorites()
    return favorites.some(fav => fav.id === recipeId)
}

/**
 * Add a recipe to favorites
 */
export function addToFavorites(favorite) {
    const favorites = getFavorites()
    favorites.push(favorite)
    saveFavorites(favorites)
}

/**
 * Remove a recipe from favorites
 */
export function removeFromFavorites(recipeId) {
    const favorites = getFavorites()
    const updatedFavorites = favorites.filter(fav => fav.id !== recipeId)
    saveFavorites(updatedFavorites)
    return updatedFavorites
}