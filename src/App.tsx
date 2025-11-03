import { useState, useEffect } from 'react';
import './App.css';
import RecipeList from './components/RecipeList';
import RecipeDetail from './components/RecipeDetail';
import SearchBar from './components/SearchBar';
import Favorites from './components/Favorites';

// Define types
interface Recipe {
  name: string;
  image: string;
  description: string;
  materials: string[];
  practice: string[];
}

interface AppState {
  recipes: Recipe[];
  loading: boolean;
  error: string | null;
  selectedRecipe: Recipe | null;
  searchHistory: string[];
  favorites: Recipe[];
  showFavorites: boolean;
}

function App() {
  const [state, setState] = useState<AppState>({
    recipes: [],
    loading: false,
    error: null,
    selectedRecipe: null,
    searchHistory: [],
    favorites: [],
    showFavorites: false,
  });

  // Load favorites from local storage on initial render
  useEffect(() => {
    const savedFavorites = localStorage.getItem('recipeFavorites');
    if (savedFavorites) {
      setState(prevState => ({
        ...prevState,
        favorites: JSON.parse(savedFavorites),
      }));
    }

    const savedSearchHistory = localStorage.getItem('searchHistory');
    if (savedSearchHistory) {
      setState(prevState => ({
        ...prevState,
        searchHistory: JSON.parse(savedSearchHistory),
      }));
    }
  }, []);

  // Save favorites to local storage when they change
  useEffect(() => {
    localStorage.setItem('recipeFavorites', JSON.stringify(state.favorites));
  }, [state.favorites]);

  // Save search history to local storage when it changes
  useEffect(() => {
    localStorage.setItem('searchHistory', JSON.stringify(state.searchHistory));
  }, [state.searchHistory]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;

    setState(prevState => ({
      ...prevState,
      loading: true,
      error: null,
      selectedRecipe: null,
    }));

    try {
      const response = await fetch(`/api/recipe?search=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Update search history
      const updatedHistory = [
        query,
        ...state.searchHistory.filter(item => item !== query),
      ].slice(0, 10);

      setState(prevState => ({
        ...prevState,
        recipes: data.data || [],
        loading: false,
        searchHistory: updatedHistory,
      }));
    } catch (error) {
      setState(prevState => ({
        ...prevState,
        error: error instanceof Error ? error.message : 'An error occurred',
        loading: false,
      }));
    }
  };

  const handleRecipeSelect = (recipe: Recipe) => {
    setState(prevState => ({
      ...prevState,
      selectedRecipe: recipe,
    }));
  };

  const handleBackToList = () => {
    setState(prevState => ({
      ...prevState,
      selectedRecipe: null,
    }));
  };

  const handleToggleFavorite = (recipe: Recipe) => {
    setState(prevState => {
      const isFavorite = prevState.favorites.some(fav => fav.name === recipe.name);
      let updatedFavorites;

      if (isFavorite) {
        updatedFavorites = prevState.favorites.filter(fav => fav.name !== recipe.name);
      } else {
        updatedFavorites = [...prevState.favorites, recipe];
      }

      return {
        ...prevState,
        favorites: updatedFavorites,
      };
    });
  };

  const handleToggleFavoritesView = () => {
    setState(prevState => ({
      ...prevState,
      showFavorites: !prevState.showFavorites,
      selectedRecipe: null,
    }));
  };

  return (
    <div className='app-container'>
      <header className='app-header'>
        <h1>菜谱搜索</h1>
        <button 
          className='favorites-button'
          onClick={handleToggleFavoritesView}
        >
          {state.showFavorites ? '返回搜索' : '我的收藏'}
        </button>
      </header>

      <main className='app-main'>
        {state.error && (
          <div className='error-message'>
            {state.error}
          </div>
        )}

        {state.showFavorites ? (
          <Favorites
            favorites={state.favorites}
            onRecipeSelect={handleRecipeSelect}
            onToggleFavorite={handleToggleFavorite}
          />
        ) : (
          <>
            <SearchBar
              onSearch={handleSearch}
              searchHistory={state.searchHistory}
            />

            {state.loading ? (
              <div className='loading-indicator'>
                加载中...
              </div>
            ) : state.recipes.length === 0 && !state.selectedRecipe ? (
              <div className='empty-state'>
                请输入菜名搜索菜谱
              </div>
            ) : state.selectedRecipe ? (
              <RecipeDetail
                recipe={state.selectedRecipe}
                onBack={handleBackToList}
                isFavorite={state.favorites.some(fav => fav.name === state.selectedRecipe?.name)}
                onToggleFavorite={handleToggleFavorite}
              />
            ) : (
              <RecipeList
                recipes={state.recipes}
                onRecipeSelect={handleRecipeSelect}
                onToggleFavorite={handleToggleFavorite}
                favorites={state.favorites}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
