import React from "react"

export default function HeartIcon({ 
    filled = false, 
    size = 20, 
    className = "",
    filledColor = "#D17557",
    emptyColor = "#E5E7EB",
    strokeColor 
}) {
    const fillColor = filled ? filledColor : emptyColor
    const stroke = strokeColor || (filled ? filledColor : "#9CA3AF")
    
    return (
        <svg 
            width={size} 
            height={Math.round(size * 0.9)} // 18/20 ratio from original
            viewBox="0 0 20 18" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <path 
                d="M10 17.27L8.18 15.63C3.64 11.58 0.5 8.69 0.5 5.5C0.5 2.42 2.92 0 6 0C7.74 0 9.39 0.81 10 2.09C10.61 0.81 12.26 0 14 0C17.08 0 19.5 2.42 19.5 5.5C19.5 8.69 16.36 11.58 11.82 15.63L10 17.27Z" 
                fill={fillColor === "currentColor" ? "currentColor" : fillColor}
                stroke={fillColor === "currentColor" ? undefined : stroke}
                strokeWidth={fillColor === "currentColor" ? undefined : "1"}
            />
        </svg>
    )
}