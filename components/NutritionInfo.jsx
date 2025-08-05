import React from "react"
import { getAvailableNutrients } from "../constants/nutrition"

export default function NutritionInfo({ nutrition }) {
    try {
        const availableNutrients = getAvailableNutrients(nutrition)
        
        if (availableNutrients.length === 0) {
            return null
        }

        const { perServing, servings } = nutrition

    return (
        <div className="nutrition-info">
            <h3>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" fill="currentColor"/>
                </svg>
                Nutrition Facts
            </h3>
            <p className="serving-info">Per serving ({servings} servings)</p>
            
            <div className="nutrition-grid">
                {availableNutrients.map(({ key, label }) => {
                    const nutrient = perServing[key]
                    return (
                        <div key={key} className="nutrition-item">
                            <span className="nutrient-label">{label}</span>
                            <span className="nutrient-value">
                                {nutrient.amount} {nutrient.unit}
                            </span>
                        </div>
                    )
                })}
            </div>
            
            <div className="nutrition-note">
                <p>Nutritional values are approximate and based on USDA data</p>
            </div>
        </div>
    )
    } catch (error) {
        console.error('Error rendering nutrition info:', error)
        return null
    }
}