import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CommunityWrite.module.scss';

const CommunityWrite: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCancel = () => {
    if (window.confirm('작성 중인 내용이 모두 사라집니다. 취소하시겠습니까?')) {
      navigate(-1);
    }
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    if (!content.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }
    
    // TODO: API 호출하여 글 작성
    console.log('제목:', title);
    console.log('내용:', content);
    console.log('이미지:', uploadedImages);
    
    alert('글이 작성되었습니다.');
    navigate('/community');
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newImages: string[] = [];
      
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            newImages.push(event.target.result as string);
            if (newImages.length === files.length) {
              setUploadedImages([...uploadedImages, ...newImages]);
              if (!showImagePreview) {
                setShowImagePreview(true);
              }
            }
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleAddMoreImages = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = (index: number) => {
    const newImages = uploadedImages.filter((_, i) => i !== index);
    setUploadedImages(newImages);
    if (newImages.length === 0) {
      setShowImagePreview(false);
    }
  };

  return (
    <div className={styles.communityWrite}>
      <div className={styles.container}>
        <div className={styles.inner}>
          <div className={styles.writeHeader}>
            <h1 className={styles.writeTitle}>글쓰기</h1>
            <button className={styles.cancelBtn} onClick={handleCancel}>
              취소
            </button>
          </div>

          <div className={styles.writeBox}>
            <div className={styles.titleSection}>
              <input
                type="text"
                className={styles.titleInput}
                placeholder="제목을 입력해주세요!"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className={styles.contentSection}>
              <textarea
                className={styles.contentTextarea}
                placeholder="내용을 입력해주세요!"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </div>

            {showImagePreview && (
              <div className={styles.imagePreviewSection}>
                <div className={styles.imageList}>
                  {uploadedImages.map((image, index) => (
                    <div key={index} className={styles.imageItem}>
                      <img src={image} alt={`업로드 이미지 ${index + 1}`} />
                      <button
                        className={styles.removeBtn}
                        onClick={() => handleRemoveImage(index)}
                      >
                        <span>&times;</span>
                      </button>
                    </div>
                  ))}
                  <button className={styles.addMoreBtn} onClick={handleAddMoreImages}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M8 3V13M3 8H13"
                        stroke="#777777"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            <div className={styles.writeFooter}>
              <button className={styles.imageBtn} onClick={handleImageClick}>
                <i className="bi bi-image"></i>
              </button>
              <button className={styles.submitBtn} onClick={handleSubmit}>
                <i className="bi bi-vector-pen"></i>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityWrite;
