import React from 'react';
import '../styles/Favorites.css';

interface Recipe {
  name: string;
  image: string;
  description: string;
  materials: string[];
  practice: string[];
}

interface FavoritesProps {
  favorites: Recipe[];
  onRecipeSelect: (recipe: Recipe) => void;
  onToggleFavorite: (recipe: Recipe) => void;
}

const Favorites: React.FC<FavoritesProps> = ({ 
  favorites, 
  onRecipeSelect, 
  onToggleFavorite 
}) => {
  if (favorites.length === 0) {
    return (
      <div className='empty-favorites'>
        <h2>我的收藏</h2>
        <p>暂无收藏的菜谱</p>
      </div>
    );
  }

  return (
    <div className='favorites-container'>
      <h2>我的收藏</h2>
      <div className='favorites-grid'>
        {favorites.map((recipe, index) => (
          <div 
            key={index}
            className='favorite-card'
            onClick={() => onRecipeSelect(recipe)}
          >
            <div className='favorite-card-image-container'>
              <img 
                src={recipe.image} 
                alt={recipe.name}
                className='favorite-card-image'
                loading='lazy'
              />
            </div>
            <div className='favorite-card-content'>
              <div className='favorite-card-header'>
                <h3 className='favorite-card-title'>{recipe.name}</h3>
                <button 
                  className='remove-favorite-button'
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(recipe);
                  }}
                  aria-label='取消收藏'
                >
                  ❌
                </button>
              </div>
              <p className='favorite-card-description'>
                {recipe.description.length > 80 
                  ? `${recipe.description.substring(0, 80)}...` 
                  : recipe.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Favorites;