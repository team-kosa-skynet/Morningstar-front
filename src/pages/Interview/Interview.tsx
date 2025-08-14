import React, { useState, useEffect } from 'react';
import styles from './Interview.module.scss';
import interviewGif from '../../assets/images/면접임시.gif';
import fileUploadIcon from '../../assets/images/file-upload.png';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { startInterview } from '../../services/apiService';

const Interview: React.FC = () => {
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [microphonePermission, setMicrophonePermission] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
  
  const {
    transcript,
    isListening,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    error: speechError
  } = useSpeechRecognition();

  useEffect(() => {
    checkMicrophonePermission();
  }, []);

  const checkMicrophonePermission = async () => {
    try {
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setMicrophonePermission(permission.state);
        
        permission.onchange = () => {
          setMicrophonePermission(permission.state);
        };
      }
    } catch (error) {
      console.log('마이크 권한 확인 실패:', error);
      setMicrophonePermission('unknown');
    }
  };

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop());
      setMicrophonePermission('granted');
      return true;
    } catch (error) {
      console.error('마이크 권한 요청 실패:', error);
      setMicrophonePermission('denied');
      return false;
    }
  };

  const handleJobSelect = (job: string) => {
    setSelectedJob(job);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleStart = async () => {
    if (!selectedJob) {
      alert('직무를 선택해주세요.');
      return;
    }

    if (!isSupported) {
      alert('음성 인식이 지원되지 않는 브라우저입니다. Chrome, Edge, Safari 브라우저를 사용해주세요.');
      return;
    }

    if (microphonePermission === 'denied') {
      alert('마이크 권한이 거부되었습니다. 브라우저 설정에서 마이크 권한을 허용해주세요.');
      return;
    }

    if (!isListening && !transcript) {
      if (microphonePermission !== 'granted') {
        const permissionGranted = await requestMicrophonePermission();
        if (!permissionGranted) {
          alert('마이크 권한이 필요합니다. 브라우저에서 마이크 사용을 허용해주세요.');
          return;
        }
      }
      
      startListening();
      return;
    }

    if (isListening) {
      stopListening();
      return;
    }

    if (transcript && !isLoading) {
      if (transcript.trim().length < 10) {
        alert('최소 10자 이상의 음성 입력이 필요합니다.');
        return;
      }

      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          alert('로그인이 필요합니다.');
          return;
        }

        const interviewData = {
          job: selectedJob,
          audioText: transcript.trim(),
          resumeFile: uploadedFile || undefined
        };

        const response = await startInterview(interviewData, token);
        
        if (response.code === 200) {
          alert('인터뷰가 시작되었습니다!');
          resetTranscript();
        } else {
          alert(response.message || '인터뷰 시작에 실패했습니다.');
        }
      } catch (error: any) {
        console.error('인터뷰 시작 오류:', error);
        if (error.response?.status === 401) {
          alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
        } else if (error.response?.status === 403) {
          alert('포인트가 부족합니다. 포인트를 충전해주세요.');
        } else {
          alert(error.message || '인터뷰 시작 중 오류가 발생했습니다.');
        }
      } finally {
        setIsLoading(false);
      }
    }
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

            {/* 음성 인식 상태 */}
            {(isListening || transcript || speechError) && (
              <div className={styles.speechStatus}>
                {speechError && (
                  <div className={styles.errorMessage}>
                    <p>❌ {speechError}</p>
                  </div>
                )}
                
                {isListening && (
                  <div className={styles.listeningIndicator}>
                    <div className={styles.recordingIcon}>🎤</div>
                    <p>음성을 인식하고 있습니다...</p>
                  </div>
                )}
                
                {transcript && (
                  <div className={styles.transcriptArea}>
                    <h4>인식된 음성:</h4>
                    <p>{transcript}</p>
                    <button 
                      className={styles.resetButton} 
                      onClick={resetTranscript}
                      type="button"
                    >
                      다시 녹음
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 시작 버튼 */}
            <button 
              className={styles.startButton} 
              onClick={handleStart}
              disabled={isLoading || !selectedJob}
            >
              {isLoading ? '처리 중...' : 
               isListening ? '녹음 중지' : 
               transcript ? '인터뷰 시작' : '음성 녹음 시작'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Interview;