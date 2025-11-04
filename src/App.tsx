import { useState, useEffect } from 'react'
import type { Recipe } from './types/Recipe'
import { Document, Page, Text, View, StyleSheet, Image, PDFDownloadLink } from '@react-pdf/renderer'
import './App.css'

function App() {
  const [searchTerm, setSearchTerm] = useState('')
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [favorites, setFavorites] = useState<Recipe[]>([])
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [showSearchHistory, setShowSearchHistory] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])

  // 防抖函数
  const debounce = (func: Function, delay: number) => {
    let timeoutId: number
    return (...args: any[]) => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => func.apply(null, args), delay)
    }
  }

  // 从localStorage加载收藏的食谱
  useEffect(() => {
    const savedFavorites = localStorage.getItem('favorites')
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites))
    }
  }, [])

  // 保存收藏的食谱到localStorage
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites))
  }, [favorites])

  // 从localStorage加载搜索历史
  useEffect(() => {
    const savedSearchHistory = localStorage.getItem('recipeSearchHistory')
    if (savedSearchHistory) {
      setSearchHistory(JSON.parse(savedSearchHistory))
    }
  }, [])

  // 保存搜索历史到localStorage
  useEffect(() => {
    localStorage.setItem('recipeSearchHistory', JSON.stringify(searchHistory))
  }, [searchHistory])

  // 获取热门搜索建议
  const getPopularSuggestions = async () => {
    try {
      const response = await fetch('/api/popular')
      if (!response.ok) throw new Error('Failed to fetch popular suggestions')
      const data = await response.json()
      setSuggestions(data.map((recipe: Recipe) => recipe.name))
    } catch (err) {
      console.error('Error fetching popular suggestions:', err)
      // 如果API调用失败，使用本地热门搜索词
      setSuggestions(['宫保鸡丁', '回锅肉', '鱼香肉丝', '麻婆豆腐', '糖醋排骨', '红烧肉', '东坡肉', '梅菜扣肉', '水煮鱼', '酸菜鱼'])
    }
  }

  // 当搜索框聚焦时获取热门搜索建议
  const handleSearchFocus = () => {
    getPopularSuggestions()
    setShowSearchHistory(true)
  }

  // 当搜索框失去焦点时隐藏搜索历史
  const handleSearchBlur = () => {
    setTimeout(() => setShowSearchHistory(false), 200) // 延迟200ms以处理点击事件
  }

  // 添加到搜索历史
  const addToSearchHistory = (query: string) => {
    if (!query.trim()) return
    // 移除重复的搜索词
    const updatedHistory = [query, ...searchHistory.filter(item => item !== query)]
    // 限制搜索历史的长度为10
    setSearchHistory(updatedHistory.slice(0, 10))
  }

  // 清除搜索历史
  const clearSearchHistory = () => {
    setSearchHistory([])
    localStorage.removeItem('recipeSearchHistory')
  }

  // 搜索食谱
  const searchRecipes = async () => {
    if (!searchTerm.trim()) return

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/recipes?search=${encodeURIComponent(searchTerm)}`)
      if (!response.ok) {
        throw new Error('Failed to fetch recipes')
      }
      const data = await response.json()
      setRecipes(data.data || [])
      setSelectedRecipe(null)
      addToSearchHistory(searchTerm) // 添加到搜索历史
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // 防抖搜索
  const debouncedSearch = debounce(searchRecipes, 500)

  // 处理搜索输入变化
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    debouncedSearch()
  }

  // 处理搜索提交
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    searchRecipes()
  }

  // 从搜索历史或建议中选择
  const selectSearchItem = (item: string) => {
    setSearchTerm(item)
    searchRecipes()
    setShowSearchHistory(false)
  }

  // 查看食谱详情
  const viewRecipeDetails = (recipe: Recipe) => {
    setSelectedRecipe(recipe)
  }

  // 返回食谱列表
  const backToList = () => {
    setSelectedRecipe(null)
  }

  // 切换收藏状态
  const toggleFavorite = (recipe: Recipe) => {
    setFavorites(prev => {
      const isFav = prev.some(fav => fav.name === recipe.name)
      if (isFav) {
        return prev.filter(fav => fav.name !== recipe.name)
      } else {
        return [...prev, recipe]
      }
    })
  }

  // 检查是否为收藏食谱
  const isFavorite = (recipe: Recipe) => {
    return favorites.some(fav => fav.name === recipe.name)
  }

  // 分享食谱
  const shareRecipe = (recipe: Recipe) => {
    const shareUrl = `${window.location.origin}/?recipe=${encodeURIComponent(recipe.name)}`
    navigator.clipboard.writeText(shareUrl)
      .then(() => alert('分享链接已复制到剪贴板！'))
      .catch(err => console.error('复制失败:', err))
  }

  // 打印食谱
  const printRecipe = () => {
    window.print()
  }

  // PDF文档样式
  const styles = StyleSheet.create({
    page: {
      padding: 30,
      backgroundColor: '#ffffff',
      fontSize: 12,
      lineHeight: 1.5,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 15,
      color: '#333333',
    },
    subtitle: {
      fontSize: 16,
      fontWeight: 'bold',
      marginTop: 20,
      marginBottom: 10,
      color: '#333333',
      borderBottom: '1px solid #e0e0e0',
      paddingBottom: 5,
    },
    text: {
      fontSize: 12,
      color: '#333333',
      marginBottom: 10,
    },
    image: {
      width: '100%',
      height: 250,
      objectFit: 'cover',
      borderRadius: 8,
      marginBottom: 20,
    },
    list: {
      marginLeft: 20,
      marginBottom: 10,
    },
    listItem: {
      fontSize: 12,
      color: '#333333',
      marginBottom: 5,
    },
  })

  // PDF文档组件
  const RecipePDF = ({ recipe }: { recipe: Recipe }) => (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{recipe.name}</Text>
        <Image style={styles.image} src={recipe.image} />
        <Text style={styles.subtitle}>简介</Text>
        <Text style={styles.text}>{recipe.description}</Text>
        <Text style={styles.subtitle}>材料</Text>
        <View style={styles.list}>
          {recipe.materials.map((material, index) => (
            <Text key={index} style={styles.listItem}>{`• ${material}`}</Text>
          ))}
        </View>
        <Text style={styles.subtitle}>做法</Text>
        <View style={styles.list}>
          {recipe.practice.map((step, index) => (
            <Text key={index} style={styles.listItem}>{`${index + 1}. ${step}`}</Text>
          ))}
        </View>
      </Page>
    </Document>
  )

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>食谱搜索</h1>
      </header>

      <main className="app-main">
        {/* 搜索栏 */}
        <div className="search-bar">
          <form onSubmit={handleSearchSubmit} style={{ position: 'relative', width: '100%' }}>
            <input
              type="text"
              placeholder="输入食谱名称..."
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              className="search-input"
              style={{ width: '100%' }}
            />
            <button type="submit" className="search-button" disabled={isLoading}>
              {isLoading ? '搜索中...' : '搜索'}
            </button>
            {/* 搜索历史和建议 */}
            {showSearchHistory && (searchHistory.length > 0 || suggestions.length > 0) && (
              <div className="search-history"
                style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: 'white',
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                  zIndex: 1000,
                  marginTop: '4px',
                  maxHeight: '300px',
                  overflowY: 'auto'
                }}
              >
                {searchHistory.length > 0 && (
                  <div className="history-section">
                    <div className="history-header" style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 12px',
                      borderBottom: '1px solid #f0f0f0'
                    }}>
                      <span style={{ fontSize: '0.9rem', color: '#666', fontWeight: '500' }}>搜索历史</span>
                      <button className="clear-history" onClick={clearSearchHistory}
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: '#999',
                          fontSize: '0.85rem',
                          cursor: 'pointer',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        清除
                      </button>
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {searchHistory.map((item, index) => (
                        <li key={index} onClick={() => selectSearchItem(item)}
                          style={{
                            padding: '8px 12px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            color: '#333',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {suggestions.length > 0 && (
                  <div className="suggestions-section">
                    <div className="suggestions-header" style={{
                      padding: '8px 12px',
                      borderBottom: '1px solid #f0f0f0',
                      fontSize: '0.9rem',
                      color: '#666',
                      fontWeight: '500'
                    }}>热门搜索</div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                      {suggestions.map((item, index) => (
                        <li key={index} onClick={() => selectSearchItem(item)}
                          style={{
                            padding: '8px 12px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            color: '#333',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>

        {/* 错误提示 */}
        {error && <div className="error-message">{error}</div>}

        {/* 食谱列表或详情 */}
        {selectedRecipe ? (
          /* 食谱详情 */
          <div className="recipe-detail">
            <button className="back-button" onClick={backToList}>
              返回列表
            </button>
            <div className="recipe-header">
              <h2>{selectedRecipe.name}</h2>
              <div className="recipe-actions">
                <button
                  className={`favorite-button ${isFavorite(selectedRecipe) ? 'active' : ''}`}
                  onClick={() => toggleFavorite(selectedRecipe)}
                  aria-label={isFavorite(selectedRecipe) ? '取消收藏' : '收藏'}
                >
                  {isFavorite(selectedRecipe) ? '★ 已收藏' : '☆ 收藏'}
                </button>
                <button className="share-button" onClick={() => shareRecipe(selectedRecipe)}>
                  分享
                </button>
                <button className="print-button" onClick={printRecipe}>
                  打印
                </button>
                <PDFDownloadLink
                  document={<RecipePDF recipe={selectedRecipe} />}
                  fileName={`${selectedRecipe.name}.pdf`}
                  className="pdf-button"
                  style={{
                    padding: '0.6rem 1.2rem',
                    backgroundColor: '#4caf50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '0.9rem',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}

                >
                  导出PDF
                </PDFDownloadLink>
              </div>
            </div>
            <img
              src={selectedRecipe.image}
              alt={selectedRecipe.name}
              className="recipe-image"
            />
            <div className="recipe-description">
              <h3>简介</h3>
              <p>{selectedRecipe.description}</p>
            </div>
            <div className="recipe-materials">
              <h3>材料</h3>
              <ul>
                {selectedRecipe.materials.map((material, index) => (
                  <li key={index}>{material}</li>
                ))}
              </ul>
            </div>
            <div className="recipe-practice">
              <h3>做法</h3>
              <ol>
                {selectedRecipe.practice.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        ) : (
          /* 食谱列表 */
          <div className="recipe-list">
            {recipes.length === 0 ? (
              <div className="no-results">
                <p>没有找到匹配的食谱</p>
              </div>
            ) : (
              recipes.map((recipe, index) => (
                <div key={index} className="recipe-card">
                  <img
                    src={recipe.image}
                    alt={recipe.name}
                    className="recipe-card-image"
                    loading="lazy"
                  />
                  <div className="recipe-card-content">
                    <h3>{recipe.name}</h3>
                    <p className="recipe-card-description">
                      {recipe.description.length > 100
                        ? `${recipe.description.substring(0, 100)}...`
                        : recipe.description}
                    </p>
                    <div className="recipe-card-actions">
                      <button
                        className="view-button"
                        onClick={() => viewRecipeDetails(recipe)}
                      >
                        查看详情
                      </button>
                      <button
                        className={`favorite-button ${isFavorite(recipe) ? 'active' : ''}`}
                        onClick={() => toggleFavorite(recipe)}
                        aria-label={isFavorite(recipe) ? '取消收藏' : '收藏'}
                      >
                        {isFavorite(recipe) ? '★' : '☆'}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 收藏夹 */}
        {favorites.length > 0 && !selectedRecipe && (
          <div className="favorites-section">
            <h2>我的收藏</h2>
            <div className="favorites-list">
              {favorites.map((recipe, index) => (
                <div key={index} className="favorite-item">
                  <span>{recipe.name}</span>
                  <button
                    className="view-button"
                    onClick={() => viewRecipeDetails(recipe)}
                  >
                    查看
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="app-footer">
        <p>食谱搜索应用 - 使用 Vite + React + Cloudflare Workers 构建</p>
      </footer>
    </div>
  )
}

export default App
