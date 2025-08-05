import React from "react"
import ReactMarkdown from "react-markdown"

export default function FavoriteRecipes() {
    const [favorites, setFavorites] = React.useState([])
    const [expandedRecipes, setExpandedRecipes] = React.useState(new Set())
    
    React.useEffect(() => {
        const savedFavorites = JSON.parse(localStorage.getItem('chefAiFavorites') || '[]')
        setFavorites(savedFavorites.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded)))
    }, [])
    
    function removeFavorite(recipeId) {
        const updatedFavorites = favorites.filter(fav => fav.id !== recipeId)
        localStorage.setItem('chefAiFavorites', JSON.stringify(updatedFavorites))
        setFavorites(updatedFavorites)
        // Remove from expanded set if it was expanded
        setExpandedRecipes(prev => {
            const newSet = new Set(prev)
            newSet.delete(recipeId)
            return newSet
        })
    }
    
    function toggleExpanded(recipeId) {
        setExpandedRecipes(prev => {
            const newSet = new Set(prev)
            if (newSet.has(recipeId)) {
                newSet.delete(recipeId)
            } else {
                newSet.add(recipeId)
            }
            return newSet
        })
    }
    
    function formatDate(dateString) {
        return new Date(dateString).toLocaleDateString()
    }
    
    if (favorites.length === 0) {
        return (
            <section className="favorites-container">
                <h2>Your Favorite Recipes</h2>
                <div className="no-favorites">
                    <p>No favorite recipes yet!</p>
                    <p>Generate some recipes and click the heart button to save your favorites.</p>
                </div>
            </section>
        )
    }
    
    return (
        <section className="favorites-container">
            <h2>Your Favorite Recipes ({favorites.length})</h2>
            <div className="favorites-list">
                {favorites.map(favorite => {
                    const isExpanded = expandedRecipes.has(favorite.id)
                    return (
                        <div key={favorite.id} className="favorite-recipe-card">
                            <div className="favorite-recipe-header">
                                <div className="favorite-title-section">
                                    <h3>{favorite.title}</h3>
                                    <button 
                                        className="expand-btn"
                                        onClick={() => toggleExpanded(favorite.id)}
                                        aria-label={isExpanded ? 'Collapse recipe' : 'Expand recipe'}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path 
                                                d={isExpanded ? "M4 6L8 10L12 6" : "M6 4L10 8L6 12"}
                                                stroke="currentColor" 
                                                strokeWidth="2" 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </button>
                                </div>
                                <div className="favorite-recipe-meta">
                                    <span className="favorite-date">Saved {formatDate(favorite.dateAdded)}</span>
                                    <button 
                                        className="remove-favorite-btn"
                                        onClick={() => removeFavorite(favorite.id)}
                                        aria-label={`Remove ${favorite.title} from favorites`}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                            
                            {favorite.ingredients.length > 0 && (
                                <div className="favorite-ingredients">
                                    <strong>Ingredients used:</strong> {favorite.ingredients.join(', ')}
                                </div>
                            )}
                            
                            {isExpanded && (
                                <div className="favorite-recipe-content">
                                    <ReactMarkdown>{favorite.recipe}</ReactMarkdown>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </section>
    )
}