import React from 'react';
import '../styles/RecipeList.css';

interface Recipe {
  name: string;
  image: string;
  description: string;
  materials: string[];
  practice: string[];
}

interface RecipeListProps {
  recipes: Recipe[];
  onRecipeSelect: (recipe: Recipe) => void;
  onToggleFavorite: (recipe: Recipe) => void;
  favorites: Recipe[];
}

const RecipeList: React.FC<RecipeListProps> = ({ 
  recipes, 
  onRecipeSelect, 
  onToggleFavorite, 
  favorites 
}) => {
  if (recipes.length === 0) {
    return null;
  }

  const isFavorite = (recipe: Recipe) => {
    return favorites.some(fav => fav.name === recipe.name);
  };

  return (
    <div className='recipe-list-container'>
      <h2 className='recipe-list-title'>搜索结果</h2>
      <div className='recipe-grid'>
        {recipes.map((recipe, index) => (
          <div 
            key={index}
            className='recipe-card'
            onClick={() => onRecipeSelect(recipe)}
          >
            <div className='recipe-card-image-container'>
              <img 
                src={recipe.image} 
                alt={recipe.name}
                className='recipe-card-image'
                loading='lazy'
              />
            </div>
            <div className='recipe-card-content'>
              <div className='recipe-card-header'>
                <h3 className='recipe-card-title'>{recipe.name}</h3>
                <button 
                  className={`favorite-button ${isFavorite(recipe) ? 'favorite' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(recipe);
                  }}
                  aria-label={isFavorite(recipe) ? '取消收藏' : '收藏'}
                >
                  {isFavorite(recipe) ? '❤️' : '🤍'}
                </button>
              </div>
              <p className='recipe-card-description'>
                {recipe.description.length > 100 
                  ? `${recipe.description.substring(0, 100)}...` 
                  : recipe.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecipeList;