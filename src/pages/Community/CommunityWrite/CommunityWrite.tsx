import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CommunityWrite.module.scss';
import { createBoard, uploadImage } from '../../../services/authApi';
import { useAuthStore } from '../../../stores/authStore';

const CommunityWrite: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCancel = () => {
    if (window.confirm('작성 중인 내용이 모두 사라집니다. 취소하시겠습니까?')) {
      navigate(-1);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    if (!content.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // 1단계: 이미지 파일들을 S3에 업로드
      const imageUrls: string[] = [];
      
      if (selectedFiles.length > 0) {
        for (let i = 0; i < selectedFiles.length; i++) {
          try {
            setUploadProgress(`이미지 ${i + 1}/${selectedFiles.length} 업로드 중...`);
            const imageUrl = await uploadImage(selectedFiles[i], token);
            imageUrls.push(imageUrl);
          } catch (error) {
            console.error(`이미지 ${i + 1} 업로드 실패:`, error);
            alert(`이미지 ${i + 1} 업로드에 실패했습니다. 다시 시도해주세요.`);
            setUploadProgress('');
            return;
          }
        }
        setUploadProgress('게시글 작성 중...');
      }

      // 2단계: 게시글 작성 (업로드된 이미지 URL들 포함)
      await createBoard(
        {
          title: title.trim(),
          content: content.trim(),
          category: '일반', // 기본 카테고리로 설정
          imageUrl: imageUrls
        },
        token
      );
      
      alert('글이 작성되었습니다.');
      navigate('/community');
    } catch (error: any) {
      console.error('게시글 작성 실패:', error);
      if (error.code === 401) {
        alert('로그인이 필요합니다.');
      } else {
        alert('게시글 작성에 실패했습니다.');
      }
    } finally {
      setIsSubmitting(false);
      setUploadProgress('');
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      const newPreviewUrls: string[] = [];
      
      newFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            newPreviewUrls.push(event.target.result as string);
            if (newPreviewUrls.length === newFiles.length) {
              setSelectedFiles([...selectedFiles, ...newFiles]);
              setPreviewUrls([...previewUrls, ...newPreviewUrls]);
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
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviewUrls = previewUrls.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviewUrls(newPreviewUrls);
    if (newFiles.length === 0) {
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
                  {previewUrls.map((image, index) => (
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
              <button className={styles.imageBtn} onClick={handleImageClick} disabled={isSubmitting}>
                <i className="bi bi-image"></i>
              </button>
              <button 
                className={styles.submitBtn} 
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  uploadProgress ? <span style={{fontSize: '10px'}}>{uploadProgress}</span> : <span>...</span>
                ) : (
                  <i className="bi bi-vector-pen"></i>
                )}
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
