import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import styles from './CommunityDetail.module.scss';
import Pagination from '../../../components/Pagination/Pagination';
import { getBoardDetail, createComment, deleteBoard, updateComment, deleteComment } from '../../../services/authApi';
import { useAuthStore } from '../../../stores/authStore';
import DropdownModal from '../../../components/DropdownModal/DropdownModal';
import { getLevelIcon } from '../../../utils/levelUtils';

interface BoardDetail {
  boardId: number;
  title: string;
  commentCount: number;
  imageUrl: string[];
  content: string;
  writer: string;
  writerLevel: number;
  createdDate: string;
  viewCount: number;
  likeCount: number;
  comments: {
    content: CommentItem[];
    totalPages: number;
    totalElements: number;
  };
}

interface CommentItem {
  commentId: number;
  content: string;
  writer: string;
  writerLevel: number;
  createdDate: number[];
}

const CommunityDetail = () => {
  const navigate = useNavigate();
  const { boardId } = useParams<{ boardId: string }>();
  const { token, user, refreshUserPoint } = useAuthStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [commentText, setCommentText] = useState('');
  const [boardDetail, setBoardDetail] = useState<BoardDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  
  // 댓글 수정 상태
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentText, setEditingCommentText] = useState('');
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);
  
  // 모달 관련 상태
  const [activeModal, setActiveModal] = useState<'post' | 'comment' | null>(null);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [modalTargetId, setModalTargetId] = useState<number | null>(null);

  // 날짜 배열을 문자열로 변환하는 함수
  const formatDateArray = (dateArray: number[]): string => {
    if (!dateArray || dateArray.length < 6) return '';
    const [year, month, day, hour, minute] = dateArray;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} ${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  };

  // 3dots 버튼 클릭 핸들러
  const handleDotsClick = (e: React.MouseEvent, type: 'post' | 'comment', targetId?: number) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setModalPosition({
      x: rect.left + rect.width / 2,
      y: rect.bottom + 5
    });
    setActiveModal(type);
    setModalTargetId(targetId || null);
  };

  // 모달 닫기
  const handleCloseModal = () => {
    setActiveModal(null);
    setModalTargetId(null);
  };

  // 댓글 수정 시작
  const handleStartCommentEdit = (commentId: number, currentText: string) => {
    setEditingCommentId(commentId);
    setEditingCommentText(currentText);
    handleCloseModal();
  };

  // 댓글 수정 취소
  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingCommentText('');
  };

  // 수정창 바깥 클릭 시 수정창 닫기
  const handleEditInputClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // 댓글 수정 제출
  const handleCommentEditSubmit = async () => {
    if (!editingCommentText.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }

    if (!token || !editingCommentId || !boardDetail) {
      alert('로그인이 필요합니다.');
      return;
    }

    setIsSubmittingEdit(true);
    try {
      await updateComment(
        editingCommentId,
        {
          boardId: boardDetail.boardId.toString(),
          content: editingCommentText.trim()
        },
        token
      );

      alert('댓글이 수정되었습니다.');
      setEditingCommentId(null);
      setEditingCommentText('');
      await fetchBoardDetail(); // 새로고침
    } catch (error: any) {
      console.error('댓글 수정 실패:', error);
      if (error.code === 401) {
        alert('로그인이 필요합니다.');
      } else {
        alert('댓글 수정에 실패했습니다.');
      }
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  // 게시글/댓글 수정
  const handleEdit = async () => {
    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      if (activeModal === 'post' && boardDetail) {
        // 게시글 수정 - 수정 페이지로 이동
        navigate(`/community/edit/${boardDetail.boardId}`);
        
      } else if (activeModal === 'comment' && modalTargetId && boardDetail) {
        // 댓글 수정 - 인라인 수정 모드로 전환
        const comment = boardDetail.comments.content.find(c => c.commentId === modalTargetId);
        if (!comment) return;

        handleStartCommentEdit(modalTargetId, comment.content);
      }
    } catch (error: any) {
      console.error('수정 실패:', error);
      alert('수정에 실패했습니다.');
    }
    
    handleCloseModal();
  };

  // 게시글/댓글 삭제
  const handleDelete = async () => {
    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      if (activeModal === 'post' && boardDetail) {
        // 게시글 삭제
        if (window.confirm('정말로 게시글을 삭제하시겠습니까?')) {
          await deleteBoard(boardDetail.boardId, token);
          alert('게시글이 삭제되었습니다.');
          navigate('/community'); // 목록으로 이동
        }
      } else if (activeModal === 'comment' && modalTargetId && boardDetail) {
        // 댓글 삭제
        if (window.confirm('정말로 댓글을 삭제하시겠습니까?')) {
          await deleteComment(modalTargetId, token);
          alert('댓글이 삭제되었습니다.');
          await fetchBoardDetail(); // 새로고침
        }
      }
    } catch (error: any) {
      console.error('삭제 실패:', error);
      alert('삭제에 실패했습니다.');
    }
    
    handleCloseModal();
  };

  // 신고하기
  const handleReport = () => {
    if (activeModal === 'post') {
      // 게시글 신고 로직
      console.log('게시글 신고');
    } else if (activeModal === 'comment' && modalTargetId) {
      // 댓글 신고 로직
      console.log('댓글 신고:', modalTargetId);
    }
    handleCloseModal();
  };

  // API에서 게시글 상세 데이터 가져오기
  const fetchBoardDetail = async () => {
    if (!boardId) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await getBoardDetail(Number(boardId), token || undefined);
      setBoardDetail(response.data);
    } catch (error: any) {
      console.error('게시글 상세 조회 실패:', error);
      if (error.code === 401) {
        setError('로그인이 필요합니다.');
      } else {
        setError('게시글을 불러오는데 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoardDetail();
  }, [boardId]);

  // 수정창 바깥 클릭 시 닫기 이벤트 리스너
  useEffect(() => {
    const handleClickOutside = () => {
      if (editingCommentId) {
        handleCancelEdit();
      }
    };

    if (editingCommentId) {
      // 약간의 지연을 두어 수정 버튼 클릭과 겹치지 않도록 함
      const timer = setTimeout(() => {
        document.addEventListener('click', handleClickOutside);
      }, 100);

      return () => {
        clearTimeout(timer);
        document.removeEventListener('click', handleClickOutside);
      };
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [editingCommentId]);

  const handleBackClick = () => {
    navigate('/community');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleCommentSubmit = async () => {
    if (!commentText.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }

    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (!boardId) return;

    setIsSubmittingComment(true);
    try {
      await createComment(
        {
          boardId: boardId,
          content: commentText.trim()
        },
        token
      );
      
      // 댓글 작성 성공 후 입력창 초기화
      setCommentText('');
      
      // 게시글 상세 정보 다시 불러오기 (댓글 목록 새로고침)
      await fetchBoardDetail();
      
      // 댓글 작성 성공 후 포인트 정보 새로고침
      try {
        await refreshUserPoint();
        console.log('포인트 새로고침 완료');
      } catch (error) {
        console.error('포인트 새로고침 실패:', error);
      }
      
      alert('댓글이 작성되었습니다.');
    } catch (error: any) {
      console.error('댓글 작성 실패:', error);
      if (error.code === 401) {
        alert('로그인이 필요합니다.');
      } else {
        alert('댓글 작성에 실패했습니다.');
      }
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.communityDetail}>
        <div className={styles.container}>
          <div className={styles.loading}>게시글을 불러오는 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.communityDetail}>
        <div className={styles.container}>
          <div className={styles.error}>{error}</div>
        </div>
      </div>
    );
  }

  if (!boardDetail) {
    return (
      <div className={styles.communityDetail}>
        <div className={styles.container}>
          <div className={styles.error}>게시글을 찾을 수 없습니다.</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.communityDetail}>
      {/* 헤더 */}
      <div className={styles.header}>
        <div className={styles.backToList} onClick={handleBackClick}>
          <svg width="10" height="17" viewBox="0 0 10 17" fill="none">
            <path d="M9 1L2 8.5L9 16" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span>목록으로</span>
        </div>
      </div>

      {/* 콘텐트 */}
      <div className={styles.container}>
        <div className={styles.inner}>
          <div className={styles.contentBox}>
            {/* 제목 영역 */}
            <div className={styles.titleSection}>
              <h1 className={styles.postTitle}>{boardDetail.title}</h1>
              <button 
                className={styles.menuButton}
                onClick={(e) => handleDotsClick(e, 'post')}
              >
                <svg width="6" height="24" viewBox="0 0 6 24" fill="none">
                  <circle cx="3" cy="3" r="2" fill="#000"/>
                  <circle cx="3" cy="12" r="2" fill="#000"/>  
                  <circle cx="3" cy="21" r="2" fill="#000"/>
                </svg>
              </button>
            </div>
            
            {/* 메타 정보 */}
            <div className={styles.metaSection}>
              <div className={styles.userInfo}>
                <img src={getLevelIcon(boardDetail.writerLevel)} alt="프로필" className={styles.profileImage} />
                <span className={styles.nickname}>{boardDetail.writer}</span>
              </div>
              <div className={styles.postMeta}>
                <div className={styles.dateInfo}>
                  <span>{boardDetail.createdDate}</span>
                </div>
                <div className={styles.divider}></div>
                <div className={styles.likeInfo}>
                  <i className="bi bi-hand-thumbs-up"></i>
                  <span>{boardDetail.likeCount}</span>
                </div>
                <div className={styles.divider}></div>
                <div className={styles.commentInfo}>
                  <i className="bi bi-chat-left-dots"></i>
                  <span>{boardDetail.commentCount}</span>
                </div>
              </div>
            </div>
            
            {/* 본문 박스 */}
            <div className={styles.contentSection}>
              <div className={styles.postContent}>
                {boardDetail.imageUrl && boardDetail.imageUrl.length > 0 && (
                  <div className={styles.imageSection}>
                    {boardDetail.imageUrl.map((url, index) => (
                      <img key={index} src={url} alt={`이미지`} className={styles.contentImage} />
                    ))}
                  </div>
                )}
                <p>{boardDetail.content}</p>
              </div>
              
              {/* 반응 박스 */}
              <div className={styles.reactionSection}>
                <button className={styles.likeButton}>
                  <i className="bi bi-hand-thumbs-up"></i>
                  <span>{boardDetail.likeCount}</span>
                </button>
              </div>
            </div>
            
            {/* 댓글 박스 */}
            <div className={styles.commentBox}>
              {/* 댓글 타이틀 */}
              <div className={styles.commentTitle}>
                <div className={styles.titleSection}>
                  <span className={styles.commentLabel}>댓글</span>
                  <span className={styles.commentCount}>{boardDetail.comments.totalElements}</span>
                </div>
              </div>
              
              {/* 댓글 입력창 */}
              <div className={styles.commentInput}>
                <div className={styles.inputWrapper}>
                  <input
                    type="text"
                    placeholder="댓글을 입력해주세요!"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isSubmittingComment) {
                        handleCommentSubmit();
                      }
                    }}
                    className={styles.commentTextField}
                    disabled={isSubmittingComment}
                  />
                  <button 
                    className={styles.submitButton}
                    onClick={handleCommentSubmit}
                    disabled={isSubmittingComment}
                  >
                    {isSubmittingComment ? (
                      <span>...</span>
                    ) : (
                      <i className="bi bi-vector-pen"></i>
                    )}
                  </button>
                </div>
              </div>
              
              {/* 댓글 목록 */}
              <div className={styles.commentList}>
                {boardDetail.comments.content.map((comment) => (
                  <div key={comment.commentId} className={styles.commentItem}>
                    <div className={styles.commentHeader}>
                      <div className={styles.userInfo}>
                        <img src={getLevelIcon(comment.writerLevel)} alt="프로필" className={styles.profileImage} />
                        <span className={styles.nickname}>{comment.writer}</span>
                      </div>
                      <button 
                        className={styles.menuButton}
                        onClick={(e) => handleDotsClick(e, 'comment', comment.commentId)}
                      >
                        <i className="bi bi-three-dots-vertical"></i>
                      </button>
                    </div>
                    <div className={styles.commentMeta}>
                      <div className={styles.commentContent}>
                        <p>{comment.content}</p>
                      </div>
                      <span className={styles.commentDate}>{formatDateArray(comment.createdDate)}</span>
                    </div>
                    
                    {/* 댓글 수정 입력창 */}
                    {editingCommentId === comment.commentId && (
                      <div className={styles.commentEditInput} onClick={handleEditInputClick}>
                        <div className={styles.inputWrapper}>
                          <input
                            type="text"
                            placeholder="수정할 댓글을 입력해주세요!"
                            value={editingCommentText}
                            onChange={(e) => setEditingCommentText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && !isSubmittingEdit) {
                                handleCommentEditSubmit();
                              } else if (e.key === 'Escape') {
                                handleCancelEdit();
                              }
                            }}
                            className={styles.commentTextField}
                            disabled={isSubmittingEdit}
                            autoFocus
                          />
                          <button 
                            className={styles.submitEditButton}
                            onClick={handleCommentEditSubmit}
                            disabled={isSubmittingEdit}
                          >
                            {isSubmittingEdit ? (
                              <span>...</span>
                            ) : (
                              <i className="bi bi-vector-pen"></i>
                            )}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* 페이지네이션 */}
              {boardDetail.comments.totalPages > 1 && (
                <div className={styles.paginationWrapper}>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={boardDetail.comments.totalPages}
                    onPageChange={handlePageChange}
                    maxVisiblePages={5}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 드롭다운 모달 */}
      <DropdownModal
        isOpen={activeModal !== null}
        onClose={handleCloseModal}
        position={modalPosition}
        isOwner={
          activeModal === 'post' 
            ? boardDetail?.writer === user?.name
            : activeModal === 'comment' && modalTargetId
              ? boardDetail?.comments.content.find(c => c.commentId === modalTargetId)?.writer === user?.name
              : false
        }
        onEdit={handleEdit}
        onDelete={handleDelete}
        onReport={handleReport}
      />
    </div>
  );
};

export default CommunityDetail;