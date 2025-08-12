import React, { useState } from 'react';
import styles from './Interview.module.scss';
import interviewGif from '../../assets/images/면접임시.gif';
import fileUploadIcon from '../../assets/images/file-upload.png';

const Interview: React.FC = () => {
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const handleJobSelect = (job: string) => {
    setSelectedJob(job);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleStart = () => {
    // TODO: API 연동
    console.log('시작하기');
  };

  return (
    <div className={styles.container}>
      <div className={styles.innerBox}>
        <div className={styles.contentWrapper}>
          {/* 왼쪽 모니터 - 비디오 영역 */}
          <div className={styles.leftMonitor}>
            <div className={styles.videoArea}>
              <img src={interviewGif} alt="면접 화면" className={styles.videoContent} />
            </div>
          </div>

          {/* 오른쪽 모니터 - 설정 영역 */}
          <div className={styles.rightMonitor}>
            {/* 직무 선택 */}
            <div className={styles.jobSelection}>
              <h3 className={styles.sectionTitle}>직무 선택</h3>
              <div className={styles.jobButtons}>
                <button
                  className={`${styles.jobButton} ${selectedJob === '풀스택' ? styles.selected : ''}`}
                  onClick={() => handleJobSelect('풀스택')}
                >
                  풀스택
                </button>
                <button
                  className={`${styles.jobButton} ${selectedJob === '프론트엔드' ? styles.selected : ''}`}
                  onClick={() => handleJobSelect('프론트엔드')}
                >
                  프론트엔드
                </button>
                <button
                  className={`${styles.jobButton} ${selectedJob === '백엔드' ? styles.selected : ''}`}
                  onClick={() => handleJobSelect('백엔드')}
                >
                  백엔드
                </button>
              </div>
            </div>

            {/* 자료 첨부 */}
            <div className={styles.fileUpload}>
              <h3 className={styles.sectionTitle}>자료 첨부 (선택)</h3>
              <div className={styles.uploadBox}>
                <div className={styles.uploadArea}>
                  <img src={fileUploadIcon} alt="파일 업로드" className={styles.uploadIcon} />
                  <p className={styles.uploadText}>자기소개서가 있다면 첨부해주세요!</p>
                  <label htmlFor="file-upload" className={styles.uploadButton}>
                    첨부하기
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    accept=".pdf,.ppt,.pptx,.doc,.docx,.hwp"
                    onChange={handleFileUpload}
                    className={styles.fileInput}
                  />
                </div>
                {uploadedFile && (
                  <div className={styles.filePreview}>
                    {uploadedFile.name}
                  </div>
                )}
                <p className={styles.fileInfo}>*pdf(권장),ppt,doc,docx,hwp (최대 50MB)</p>
              </div>
            </div>

            {/* 유의사항 */}
            <div className={styles.notice}>
              <h3 className={styles.sectionTitle}>유의사항</h3>
              <ul className={styles.noticeList}>
                <li>시작 시 포인트 50p 가 차감됩니다.</li>
                <li>시작 전 마이크와 스피커 연결 상태를<br/>확인해주시기 바랍니다.</li>
                <li>중간 취소 시 진행상황이 이어지지 않습니다.</li>
                <li>조용한 장소에서 진행해주시기 바랍니다.</li>
              </ul>
            </div>

            {/* 시작 버튼 */}
            <button className={styles.startButton} onClick={handleStart}>
              시작하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Interview;