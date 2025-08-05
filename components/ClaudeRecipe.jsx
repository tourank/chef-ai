import React from "react"
import ReactMarkdown from "react-markdown"
import NutritionInfo from "./NutritionInfo"
import HeartIcon from "./HeartIcon"
import { generateRecipeId, isRecipeFavorited, addToFavorites, removeFromFavorites } from "../utils/favorites"

export default function ClaudeRecipe(props) {
    const [isFavorited, setIsFavorited] = React.useState(false)
    
    React.useEffect(() => {
        const recipeId = generateRecipeId(props.recipe)
        setIsFavorited(isRecipeFavorited(recipeId))
    }, [props.recipe])
    
    
    function toggleFavorite() {
        const recipeId = generateRecipeId(props.recipe)
        
        if (isFavorited) {
            removeFromFavorites(recipeId)
            setIsFavorited(false)
        } else {
            const newFavorite = {
                id: recipeId,
                title: extractRecipeTitle(props.recipe),
                recipe: props.recipe,
                ingredients: props.ingredients || [],
                nutrition: props.nutrition || null,
                dateAdded: new Date().toISOString()
            }
            addToFavorites(newFavorite)
            setIsFavorited(true)
        }
    }
    
    function extractRecipeTitle(recipe) {
        const lines = recipe.split('\n').map(line => line.trim()).filter(line => line.length > 0)
        
        // Common phrases to skip when looking for titles
        const skipPhrases = [
            'here\'s the recipe', 'here is the recipe', 'recipe:', 'ingredients:', 'instructions:', 
            'directions:', 'method:', 'preparation:', 'cooking instructions:', 'let me suggest',
            'i suggest', 'try this', 'perfect recipe', 'great recipe', 'delicious recipe',
            'easy recipe', 'simple recipe', 'chef claude recommends'
        ]
        
        // Look for various title patterns
        for (const line of lines) {
            const lowerLine = line.toLowerCase()
            
            // Skip common generic phrases
            if (skipPhrases.some(phrase => lowerLine.includes(phrase))) {
                continue
            }
            
            // Markdown headers (# or ##)
            if (line.match(/^#+\s+/)) {
                const title = line.replace(/^#+\s*/, '')
                if (title.length > 3 && title.length < 60) {
                    return title
                }
            }
            
            // Bold text that looks like a title
            if (line.match(/^\*\*[^*]+\*\*$/)) {
                const title = line.replace(/^\*\*|\*\*$/g, '')
                if (title.length > 3 && title.length < 60) {
                    return title
                }
            }
            
            // Lines that end with colon (recipe names often do)
            if (line.match(/^[A-Z][^:]{3,40}:?\s*$/) && 
                !lowerLine.includes('ingredients') && 
                !lowerLine.includes('instructions') &&
                !lowerLine.includes('directions') &&
                !lowerLine.includes('method') &&
                !lowerLine.includes('steps')) {
                return line.replace(/:?\s*$/, '')
            }
            
            // Look for food-related words that might indicate a recipe title
            const foodWords = ['chicken', 'beef', 'pasta', 'soup', 'salad', 'cake', 'bread', 'rice', 'fish', 'pizza', 'curry', 'stir', 'roast', 'baked', 'grilled', 'fried', 'sautéed', 'braised']
            if (foodWords.some(word => lowerLine.includes(word)) && 
                line.length > 5 && line.length < 50 && 
                line.match(/^[A-Z]/)) {
                return line
            }
            
            // First substantial line that looks like a title (more restrictive)
            if (line.length > 8 && line.length < 50 && 
                line.match(/^[A-Z]/) && 
                !line.includes('?') && 
                !line.includes('.') &&
                !lowerLine.startsWith('to ') &&
                !lowerLine.startsWith('for ') &&
                !lowerLine.startsWith('with ')) {
                return line
            }
        }
        
        // If no good title found, generate one from ingredients
        if (props.ingredients && props.ingredients.length > 0) {
            const mainIngredients = props.ingredients.slice(0, 2)
            return `${mainIngredients.join(' & ')} Recipe`
        }
        
        return 'Delicious Recipe'
    }
    
    return (
        <section className="suggested-recipe-container" aria-live="polite">
            <div className="recipe-header">
                <h2>Chef Claude Recommends:</h2>
                <button 
                    className={`favorite-btn ${isFavorited ? 'favorited' : ''}`}
                    onClick={toggleFavorite}
                    aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                >
                    <HeartIcon filled={isFavorited} size={20} />
                </button>
            </div>
            <ReactMarkdown>{props.recipe}</ReactMarkdown>
            <NutritionInfo nutrition={props.nutrition} />
        </section>
    )
}