import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './CommunityEdit.module.scss';
import { updateBoard, uploadImage, getBoardDetail } from '../../../services/apiService.ts';
import { useAuthStore } from '../../../stores/authStore';

const CommunityEdit: React.FC = () => {
  const navigate = useNavigate();
  const { boardId } = useParams<{ boardId: string }>();
  const { token } = useAuthStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isQuestion, setIsQuestion] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 기존 게시글 데이터 불러오기
  useEffect(() => {
    const fetchBoardData = async () => {
      if (!boardId) {
        alert('잘못된 접근입니다.');
        navigate('/community');
        return;
      }

      try {
        const response = await getBoardDetail(Number(boardId), token || undefined);
        const boardData = response.data;
        
        setTitle(boardData.title);
        setContent(boardData.content);
        setExistingImages(boardData.imageUrl || []);
        setIsQuestion(boardData.category === 'QUESTION');
        
        if (boardData.imageUrl && boardData.imageUrl.length > 0) {
          setShowImagePreview(true);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('게시글 불러오기 실패:', error);
        alert('게시글을 불러올 수 없습니다.');
        navigate('/community');
      }
    };

    fetchBoardData();
  }, [boardId, token, navigate]);

  const handleCancel = () => {
    if (window.confirm('수정 중인 내용이 모두 사라집니다. 취소하시겠습니까?')) {
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
      // 1단계: 새로 추가된 이미지 파일들을 S3에 업로드
      const newImageUrls: string[] = [];
      
      if (selectedFiles.length > 0) {
        for (let i = 0; i < selectedFiles.length; i++) {
          try {
            setUploadProgress(`이미지 ${i + 1}/${selectedFiles.length} 업로드 중...`);
            const imageUrl = await uploadImage(selectedFiles[i], token);
            newImageUrls.push(imageUrl);
          } catch (error) {
            console.error(`이미지 ${i + 1} 업로드 실패:`, error);
            alert(`이미지 ${i + 1} 업로드에 실패했습니다. 다시 시도해주세요.`);
            setUploadProgress('');
            return;
          }
        }
        setUploadProgress('게시글 수정 중...');
      }

      // 2단계: 게시글 수정 (기존 이미지 + 새 이미지 URL들 포함)
      const allImageUrls = [...existingImages, ...newImageUrls];
      
      await updateBoard(
        Number(boardId),
        {
          title: title.trim(),
          content: content.trim(),
          category: isQuestion ? 'QUESTION' : 'GENERAL',
          imageUrl: allImageUrls
        },
        token
      );
      
      alert('글이 수정되었습니다.');
      navigate(`/community/detail/${boardId}`);
    } catch (error: any) {
      console.error('게시글 수정 실패:', error);
      if (error.code === 401) {
        alert('로그인이 필요합니다.');
      } else {
        alert('게시글 수정에 실패했습니다.');
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

  // 기존 이미지 제거
  const handleRemoveExistingImage = (index: number) => {
    const newExistingImages = existingImages.filter((_, i) => i !== index);
    setExistingImages(newExistingImages);
    
    if (newExistingImages.length === 0 && previewUrls.length === 0) {
      setShowImagePreview(false);
    }
  };

  // 새로 추가된 이미지 제거
  const handleRemoveNewImage = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newPreviewUrls = previewUrls.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
    setPreviewUrls(newPreviewUrls);
    
    if (existingImages.length === 0 && newPreviewUrls.length === 0) {
      setShowImagePreview(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.communityEdit}>
        <div className={styles.container}>
          <div className={styles.inner}>
            <div className={styles.loading}>게시글을 불러오는 중...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.communityEdit}>
      <div className={styles.container}>
        <div className={styles.inner}>
          <div className={styles.writeHeader}>
            <h1 className={styles.writeTitle}>수정하기</h1>
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
                  {/* 기존 이미지들 */}
                  {existingImages.map((image, index) => (
                    <div key={`existing-${index}`} className={styles.imageItem}>
                      <img src={image} alt={`기존 이미지 ${index + 1}`} />
                      <button
                        className={styles.removeBtn}
                        onClick={() => handleRemoveExistingImage(index)}
                      >
                        <span>&times;</span>
                      </button>
                    </div>
                  ))}
                  
                  {/* 새로 추가된 이미지들 */}
                  {previewUrls.map((image, index) => (
                    <div key={`new-${index}`} className={styles.imageItem}>
                      <img src={image} alt={`새 이미지 ${index + 1}`} />
                      <button
                        className={styles.removeBtn}
                        onClick={() => handleRemoveNewImage(index)}
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
              <div className={styles.rightActions}>
                <label className={styles.questionCheckbox}>
                  <input
                    type="checkbox"
                    checked={isQuestion}
                    onChange={(e) => setIsQuestion(e.target.checked)}
                  />
                  <span>질문</span>
                </label>
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

export default CommunityEdit;