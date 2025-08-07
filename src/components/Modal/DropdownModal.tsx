import React from 'react';
import styles from './DropdownModal.module.scss';

interface DropdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  isOwner: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onReport?: () => void;
}

const DropdownModal: React.FC<DropdownModalProps> = ({
  isOpen,
  onClose,
  position,
  isOwner,
  onEdit,
  onDelete,
  onReport,
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      {/* 배경 클릭 감지용 */}
      <div className={styles.backdrop} onClick={handleBackdropClick} />
      
      {/* 모달 */}
      <div
        className={styles.modal}
        style={{
          top: position.y,
          left: position.x,
        }}
      >
        {isOwner ? (
          // 작성자인 경우: 수정하기, 삭제하기
          <>
            <button className={styles.menuItem} onClick={onEdit}>
              수정하기
            </button>
            <div className={styles.divider} />
            <button className={styles.menuItem} onClick={onDelete}>
              삭제하기
            </button>
          </>
        ) : (
          // 작성자가 아닌 경우: 신고하기
          <button className={styles.menuItem} onClick={onReport}>
            신고하기
          </button>
        )}
      </div>
    </>
  );
};

export default DropdownModal;