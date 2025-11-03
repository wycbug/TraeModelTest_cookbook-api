import React, { useState } from 'react';
import '../styles/RecipeDetail.css';

interface Recipe {
  name: string;
  image: string;
  description: string;
  materials: string[];
  practice: string[];
}

interface RecipeDetailProps {
  recipe: Recipe;
  onBack: () => void;
  isFavorite: boolean;
  onToggleFavorite: (recipe: Recipe) => void;
}

const RecipeDetail: React.FC<RecipeDetailProps> = ({ 
  recipe, 
  onBack, 
  isFavorite, 
  onToggleFavorite 
}) => {
  const [showZoomModal, setShowZoomModal] = useState(false);

  const handleImageClick = () => {
    setShowZoomModal(true);
  };

  const handleCloseZoomModal = () => {
    setShowZoomModal(false);
  };

  const handleShare = async () => {
    const shareData = {
      title: recipe.name,
      text: recipe.description,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback for browsers that don't support Web Share API
        await navigator.clipboard.writeText(window.location.href);
        alert('链接已复制到剪贴板');
      }
    } catch (error) {
      console.error('分享失败:', error);
      alert('分享失败，请稍后重试');
    }
  };

  const handleExportPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');
      
      const recipeElement = document.querySelector('.recipe-detail-container') as HTMLElement;
      if (!recipeElement) return;

      const canvas = await html2canvas(recipeElement, {
        scale: 2, // Higher scale for better quality
        useCORS: true, // Enable CORS for images
      } as any);
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Calculate dimensions to fit the image on the PDF
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${recipe.name}.pdf`);
    } catch (error) {
      console.error('导出PDF失败:', error);
      alert('导出PDF失败，请稍后重试');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className='recipe-detail-container'>
      <button 
        className='back-button'
        onClick={onBack}
        aria-label='返回列表'
      >
        ← 返回
      </button>

      <div className='recipe-header'>
        <h2 className='recipe-title'>{recipe.name}</h2>
        <div className='recipe-actions'>
          <button 
            className={`favorite-button ${isFavorite ? 'favorite' : ''}`}
            onClick={() => onToggleFavorite(recipe)}
            aria-label={isFavorite ? '取消收藏' : '收藏'}
          >
            {isFavorite ? '❤️ 已收藏' : '🤍 收藏'}
          </button>
          <button 
            className='share-button'
            onClick={handleShare}
            aria-label='分享'
          >
            📤 分享
          </button>
          <button 
            className='export-button'
            onClick={handleExportPDF}
            aria-label='导出PDF'
          >
            📥 导出PDF
          </button>
          <button 
            className='print-button'
            onClick={handlePrint}
            aria-label='打印'
          >
            🖨️ 打印
          </button>
        </div>
      </div>

      <div className='recipe-image-container'>
        <img 
          src={recipe.image} 
          alt={recipe.name}
          className='recipe-image'
          onClick={handleImageClick}
          aria-label='点击放大图片'
        />
      </div>

      <div className='recipe-description'>
        <h3>菜品简介</h3>
        <p>{recipe.description}</p>
      </div>

      <div className='recipe-materials'>
        <h3>材料清单</h3>
        <ul>
          {recipe.materials.map((material, index) => (
            <li key={index} className='material-item'>
              {material}
            </li>
          ))}
        </ul>
      </div>

      <div className='recipe-steps'>
        <h3>制作步骤</h3>
        <ol>
          {recipe.practice.map((step, index) => (
            <li key={index} className='step-item'>
              <span className='step-number'>{index + 1}</span>
              <span className='step-text'>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Image Zoom Modal */}
      {showZoomModal && (
        <div className='zoom-modal'>
          <div className='zoom-modal-overlay' onClick={handleCloseZoomModal}></div>
          <div className='zoom-modal-content'>
            <button 
              className='close-modal-button'
              onClick={handleCloseZoomModal}
              aria-label='关闭'
            >
              ×
            </button>
            <img 
              src={recipe.image} 
              alt={recipe.name}
              className='zoom-image'
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeDetail;