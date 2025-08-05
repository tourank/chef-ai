import React from "react"
import ReactMarkdown from "react-markdown"

export default function ClaudeRecipe(props) {
    const [isFavorited, setIsFavorited] = React.useState(false)
    
    React.useEffect(() => {
        const favorites = JSON.parse(localStorage.getItem('chefAiFavorites') || '[]')
        const recipeId = generateRecipeId(props.recipe)
        setIsFavorited(favorites.some(fav => fav.id === recipeId))
    }, [props.recipe])
    
    function generateRecipeId(recipe) {
        return btoa(recipe.slice(0, 100)).replace(/[^a-zA-Z0-9]/g, '').slice(0, 20)
    }
    
    function toggleFavorite() {
        const favorites = JSON.parse(localStorage.getItem('chefAiFavorites') || '[]')
        const recipeId = generateRecipeId(props.recipe)
        const recipeTitle = extractRecipeTitle(props.recipe)
        
        if (isFavorited) {
            const updatedFavorites = favorites.filter(fav => fav.id !== recipeId)
            localStorage.setItem('chefAiFavorites', JSON.stringify(updatedFavorites))
            setIsFavorited(false)
        } else {
            const newFavorite = {
                id: recipeId,
                title: recipeTitle,
                recipe: props.recipe,
                ingredients: props.ingredients || [],
                dateAdded: new Date().toISOString()
            }
            favorites.push(newFavorite)
            localStorage.setItem('chefAiFavorites', JSON.stringify(favorites))
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
                    <svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path 
                            d="M10 17.27L8.18 15.63C3.64 11.58 0.5 8.69 0.5 5.5C0.5 2.42 2.92 0 6 0C7.74 0 9.39 0.81 10 2.09C10.61 0.81 12.26 0 14 0C17.08 0 19.5 2.42 19.5 5.5C19.5 8.69 16.36 11.58 11.82 15.63L10 17.27Z" 
                            fill={isFavorited ? '#D17557' : '#E5E7EB'}
                            stroke={isFavorited ? '#D17557' : '#9CA3AF'}
                            strokeWidth="1"
                        />
                    </svg>
                </button>
            </div>
            <ReactMarkdown>{props.recipe}</ReactMarkdown>
        </section>
    )
}