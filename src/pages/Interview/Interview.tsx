import React, { useState, useEffect } from 'react';
import styles from './Interview.module.scss';
import fileUploadIcon from '../../assets/images/file-upload.png';
import geminiIcon from '../../assets/images/gemini-1336519698502187930_128px.png';
import anthropicIcon from '../../assets/images/anthropic (1).svg';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { 
  uploadDocument, 
  createInterviewSession, 
  submitInterviewTurn, 
  finalizeInterviewReport 
} from '../../services/apiService';

const Interview: React.FC = () => {
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [microphonePermission, setMicrophonePermission] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
  const [interviewStarted, setInterviewStarted] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  
  // New state for API flow
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [questionIntent, setQuestionIntent] = useState<string>('');
  const [answerGuides, setAnswerGuides] = useState<string[]>([]);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [greeting, setGreeting] = useState<string>('');
  const [isUploadingDocument, setIsUploadingDocument] = useState<boolean>(false);
  
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      
      // Automatically upload the document
      const token = localStorage.getItem('token');
      if (token) {
        setIsUploadingDocument(true);
        try {
          const response = await uploadDocument(file, token);
          if (response.code === 200) {
            setDocumentId(response.data);
            console.log('Document uploaded successfully:', response.data);
          } else {
            alert('문서 업로드에 실패했습니다: ' + response.message);
            setUploadedFile(null);
          }
        } catch (error: any) {
          console.error('Document upload error:', error);
          alert('문서 업로드 중 오류가 발생했습니다.');
          setUploadedFile(null);
        } finally {
          setIsUploadingDocument(false);
        }
      }
    }
  };

  const handleStart = async () => {
    if (!selectedJob) {
      alert('직무를 선택해주세요.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }

    setIsLoading(true);
    try {
      // Map selected job to API format
      const jobRoleMap: {[key: string]: string} = {
        '풀스택': 'FULLSTACK',
        '프론트엔드': 'FRONTEND', 
        '백엔드': 'BACKEND'
      };

      // Get user info for display name
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
      const displayName = userInfo.name || '사용자';

      const sessionData = {
        displayName,
        jobRole: jobRoleMap[selectedJob] || 'BACKEND',
        documentId
      };

      const response = await createInterviewSession(sessionData, token);
      
      if (response.code === 200) {
        setSessionId(response.data.sessionId);
        setGreeting(response.data.greeting);
        setCurrentQuestion(response.data.firstQuestion);
        setTotalQuestions(response.data.totalQuestions);
        setCurrentQuestionIndex(0);
        setInterviewStarted(true);
      } else {
        alert(response.message || '인터뷰 세션 생성에 실패했습니다.');
      }
    } catch (error: any) {
      console.error('Session creation error:', error);
      if (error.response?.status === 401) {
        alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
      } else if (error.response?.status === 403) {
        alert('포인트가 부족합니다. 포인트를 충전해주세요.');
      } else {
        alert(error.message || '인터뷰 세션 생성 중 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicStart = async () => {
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

    if (transcript && !isLoading && sessionId) {
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

        const turnData = {
          sessionId,
          questionIndex: currentQuestionIndex,
          transcript: transcript.trim()
        };

        const response = await submitInterviewTurn(turnData, token);
        
        if (response.code === 200) {
          resetTranscript();
          
          // Check if this was the last question
          if (currentQuestionIndex >= totalQuestions - 1) {
            // Interview finished, finalize report
            try {
              const reportResponse = await finalizeInterviewReport({ sessionId }, token);
              if (reportResponse.code === 200) {
                alert('인터뷰가 완료되었습니다! 결과를 확인해보세요.');
                // TODO: Navigate to results page or show results
                console.log('Interview report:', reportResponse.data);
              }
            } catch (error) {
              console.error('Report finalization error:', error);
              alert('인터뷰는 완료되었지만 리포트 생성에 실패했습니다.');
            }
          } else {
            // Move to next question
            setCurrentQuestion(response.data.nextQuestion);
            setQuestionIntent(response.data.questionIntent);
            setAnswerGuides(response.data.answerGuides);
            setCurrentQuestionIndex(prev => prev + 1);
          }
        } else {
          alert(response.message || '인터뷰 처리에 실패했습니다.');
        }
      } catch (error: any) {
        console.error('인터뷰 처리 오류:', error);
        if (error.response?.status === 401) {
          alert('로그인이 만료되었습니다. 다시 로그인해주세요.');
        } else if (error.response?.status === 403) {
          alert('포인트가 부족합니다. 포인트를 충전해주세요.');
        } else {
          alert(error.message || '인터뷰 처리 중 오류가 발생했습니다.');
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
          {/* 왼쪽 모니터 */}
          <div className={styles.leftMonitor}>
            {!interviewStarted ? (
              // 초기 화면 - 검은 배경
              <div className={styles.videoArea}>
              </div>
            ) : (
              // 인터뷰 시작 후 - 질문 화면
              <div className={styles.questionArea}>
                <div className={styles.questionBox}>
                  <div className={styles.questionHeader}>
                    <span className={styles.questionNumber}>Q{currentQuestionIndex + 1}.</span>
                    <div className={styles.questionProgress}>
                      {currentQuestionIndex + 1} / {totalQuestions}
                    </div>
                  </div>
                  <div className={styles.questionContent}>
                    <p className={styles.questionText}>{currentQuestion}</p>
                  </div>
                  <button 
                    className={styles.micButton} 
                    onClick={handleMicStart}
                    disabled={isLoading}
                  >
                    <i className="bi bi-mic-fill"></i>
                    <span>
                      {isLoading ? '처리 중...' : 
                       isListening ? '녹음 중지' : 
                       transcript ? '답변 제출' : '시작'}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 오른쪽 모니터 */}
          <div className={styles.rightMonitor}>
            {!interviewStarted ? (
              // 초기 화면 - 설정 영역
              <>
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
                        {isUploadingDocument && <span> (업로드 중...)</span>}
                        {documentId && <span> ✓ 업로드 완료</span>}
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
                <button 
                  className={styles.startButton} 
                  onClick={handleStart}
                  disabled={isLoading || isUploadingDocument}
                >
                  {isLoading ? '세션 생성 중...' : isUploadingDocument ? '문서 업로드 중...' : '시작하기'}
                </button>
              </>
            ) : (
              // 인터뷰 시작 후 - 답변 가이드 영역
              <>
                <div className={styles.guideHeader}>
                  <img src={anthropicIcon} alt="anthropic" className={styles.guideIcon} />
                  <h3 className={styles.guideTitle}>답변 가이드</h3>
                </div>

                {questionIntent && (
                  <div className={styles.intentSection}>
                    <div className={styles.intentHeader}>
                      <img src={geminiIcon} alt="gemini" className={styles.intentIcon} />
                      <h4 className={styles.intentTitle}>질문 의도</h4>
                    </div>
                    <p className={styles.intentText}>{questionIntent}</p>
                  </div>
                )}

                {answerGuides.length > 0 && (
                  <div className={styles.guidelinesSection}>
                    <div className={styles.guidelinesHeader}>
                      <img src={geminiIcon} alt="gemini" className={styles.guidelineIcon} />
                      <h4 className={styles.guidelinesTitle}>답변 가이드</h4>
                    </div>
                    <div className={styles.guidelinesList}>
                      {answerGuides.map((guideline, index) => (
                        <div key={index} className={styles.guidelineItem}>
                          {guideline}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Interview;