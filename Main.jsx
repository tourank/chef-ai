import React from "react"
import IngredientsList from "./components/IngredientsList"
import ClaudeRecipe from "./components/ClaudeRecipe"
import FavoriteRecipes from "./components/FavoriteRecipes"
import { getRecipeFromChefClaude} from "./ai"


export default function Main() {
    const [ingredients, setIngredients] = React.useState([])
    const [recipe, setRecipe] = React.useState("")
    const [currentView, setCurrentView] = React.useState("generate") // "generate" or "favorites"
    const [isLoading, setIsLoading] = React.useState(false)

    async function getRecipe() {
        setIsLoading(true)
        try {
            const recipeMarkdown = await getRecipeFromChefClaude(ingredients)
            setRecipe(recipeMarkdown)
        } catch (error) {
            console.error('Error generating recipe:', error)
            setRecipe("Sorry, there was an error generating your recipe. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    function addIngredient(event) {
        event.preventDefault()
        const formData = new FormData(event.target)
        const newIngredient = formData.get("ingredient")
        
        // Handle comma-separated ingredients
        const ingredientList = newIngredient.split(',')
            .map(ingredient => ingredient.trim())
            .filter(ingredient => ingredient.length > 0)
        
        setIngredients(prevIngredients => [...prevIngredients, ...ingredientList])
        event.target.reset()
    }

    return (
        <main>
            <nav className="main-nav">
                <button 
                    className={`nav-btn ${currentView === 'generate' ? 'active' : ''}`}
                    onClick={() => setCurrentView('generate')}
                >
                    Generate Recipe
                </button>
                <button 
                    className={`nav-btn ${currentView === 'favorites' ? 'active' : ''}`}
                    onClick={() => setCurrentView('favorites')}
                >
                    <span className="nav-btn-content">
                        Favorites
                        <svg width="16" height="14" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path 
                                d="M10 17.27L8.18 15.63C3.64 11.58 0.5 8.69 0.5 5.5C0.5 2.42 2.92 0 6 0C7.74 0 9.39 0.81 10 2.09C10.61 0.81 12.26 0 14 0C17.08 0 19.5 2.42 19.5 5.5C19.5 8.69 16.36 11.58 11.82 15.63L10 17.27Z" 
                                fill="currentColor"
                            />
                        </svg>
                    </span>
                </button>
            </nav>

            {currentView === 'generate' ? (
                <>
                    <form onSubmit={addIngredient} className="add-ingredient-form">
                        <input
                            type="text"
                            placeholder="e.g. oregano, tomatoes, cheese (separate with commas)"
                            aria-label="Add ingredients"
                            name="ingredient"
                        />
                        <button>Add ingredient{ingredients.length < 4 ? 's' : ''}</button>
                    </form>
                    
                    {ingredients.length > 0 && ingredients.length < 4 && (
                        <div className="ingredient-requirement">
                            <p>Need {4 - ingredients.length} more ingredient{4 - ingredients.length > 1 ? 's' : ''} to generate a recipe</p>
                        </div>
                    )}

                    {ingredients.length > 0 &&
                        <IngredientsList
                            ingredients={ingredients}
                            getRecipe={getRecipe}
                            isLoading={isLoading}
                        />
                    }

                    {recipe && !isLoading && <ClaudeRecipe recipe={recipe} ingredients={ingredients} />}
                </>
            ) : (
                <FavoriteRecipes />
            )}
        </main>
    )
}
