import React from "react"
import IngredientsList from "./components/IngredientsList"
import ClaudeRecipe from "./components/ClaudeRecipe"
import FavoriteRecipes from "./components/FavoriteRecipes"
import HeartIcon from "./components/HeartIcon"
import { getRecipeFromChefClaude} from "./ai"
import { getNutritionForIngredients, calculateRecipeNutrition } from "./usda-api"


export default function Main() {
    const [ingredients, setIngredients] = React.useState([])
    const [recipe, setRecipe] = React.useState("")
    const [nutrition, setNutrition] = React.useState(null)
    const [currentView, setCurrentView] = React.useState("generate") // "generate" or "favorites"
    const [isLoading, setIsLoading] = React.useState(false)

    async function getRecipe() {
        setIsLoading(true)
        try {
            // Generate recipe and fetch nutrition data in parallel for better performance
            const [recipeMarkdown, nutritionData] = await Promise.all([
                getRecipeFromChefClaude(ingredients),
                getNutritionForIngredients(ingredients)
            ])
            
            setRecipe(recipeMarkdown)
            
            // Calculate and set nutrition data
            const recipeNutrition = nutritionData.length > 0 
                ? calculateRecipeNutrition(nutritionData)
                : null
            setNutrition(recipeNutrition)
            
        } catch (error) {
            console.error('Error generating recipe:', error)
            setRecipe("Sorry, there was an error generating your recipe. Please try again.")
            setNutrition(null)
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
                        <HeartIcon size={16} filledColor="currentColor" />
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

                    {recipe && !isLoading && <ClaudeRecipe recipe={recipe} ingredients={ingredients} nutrition={nutrition} />}
                </>
            ) : (
                <FavoriteRecipes />
            )}
        </main>
    )
}
