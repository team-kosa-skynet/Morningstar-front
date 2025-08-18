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
import { playTtsAudio, stopCurrentAudio, isAudioPlaying } from '../../utils/audioUtils';
import CoachingModal from '../../components/CoachingModal/CoachingModal';
import InterviewReport from '../../components/InterviewReport/InterviewReport';

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
  const [isUploadingDocument, setIsUploadingDocument] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  
  // 새로운 API 응답 필드들
  const [coachingTips, setCoachingTips] = useState<string>('');
  const [scoreDelta, setScoreDelta] = useState<Record<string, number>>({});
  const [isDone, setIsDone] = useState<boolean>(false);
  const [showCoachingModal, setShowCoachingModal] = useState<boolean>(false);
  const [pendingNextQuestion, setPendingNextQuestion] = useState<string>('');
  const [pendingTtsData, setPendingTtsData] = useState<any>(null);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [reportData, setReportData] = useState<any>(null);
  const [isTextInputMode, setIsTextInputMode] = useState<boolean>(false);
  const [textAnswer, setTextAnswer] = useState<string>('');
  
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
        setCurrentQuestion(response.data.firstQuestion);
        setQuestionIntent(response.data.questionIntent || '');
        setAnswerGuides(response.data.answerGuides || []);
        setTotalQuestions(response.data.totalQuestions);
        setCurrentQuestionIndex(0);
        setInterviewStarted(true);
        
        // 첫 번째 질문 오디오 재생 (인사말 + 첫 번째 질문)
        if (response.data.tts) {
          try {
            setIsPlayingAudio(true);
            await playTtsAudio(response.data.tts);
          } catch (error) {
            console.error('오디오 재생 실패:', error);
          } finally {
            setIsPlayingAudio(false);
          }
        }
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

    // 녹음 시작
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

    // 녹음 중지 및 바로 제출
    if (isListening) {
      stopListening();
      
      // 약간의 지연 후 제출 (transcript가 업데이트될 시간을 줌)
      setTimeout(async () => {
        if (transcript && !isLoading && sessionId) {
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
              
              // 응답 데이터로 상태 업데이트
              setQuestionIntent(response.data.questionIntent);
              setAnswerGuides(response.data.answerGuides);
              setScoreDelta(response.data.scoreDelta);
              setCurrentQuestionIndex(response.data.currentIndex);
              setIsDone(response.data.done);
              
              // Check if interview is done
              if (response.data.done) {
                // Interview finished, finalize report
                try {
                  const reportResponse = await finalizeInterviewReport({ sessionId }, token);
                  if (reportResponse.code === 200) {
                    setReportData(reportResponse.data);
                    setShowReportModal(true);
                  } else {
                    alert('리포트 생성에 실패했습니다: ' + reportResponse.message);
                  }
                } catch (error) {
                  console.error('Report finalization error:', error);
                  alert('인터뷰는 완료되었지만 리포트 생성에 실패했습니다.');
                }
              } else {
                // 코칭 팁이 있으면 모달 표시, 없으면 바로 다음 질문 진행
                if (response.data.coachingTips) {
                  setCoachingTips(response.data.coachingTips);
                  setPendingNextQuestion(response.data.nextQuestion);
                  setPendingTtsData(response.data.tts);
                  setShowCoachingModal(true);
                } else {
                  // 바로 다음 질문 진행
                  setCurrentQuestion(response.data.nextQuestion);
                  
                  // 다음 질문 오디오 재생
                  if (response.data.tts) {
                    try {
                      setIsPlayingAudio(true);
                      await playTtsAudio(response.data.tts);
                    } catch (error) {
                      console.error('오디오 재생 실패:', error);
                    } finally {
                      setIsPlayingAudio(false);
                    }
                  }
                }
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
      }, 500); // 0.5초 지연
      return;
    }
  };

  const handleCoachingModalClose = async () => {
    setShowCoachingModal(false);
    
    // 모달이 닫힌 후 다음 질문 진행
    if (pendingNextQuestion) {
      setCurrentQuestion(pendingNextQuestion);
      setPendingNextQuestion('');
      
      // 다음 질문 오디오 재생
      if (pendingTtsData) {
        try {
          setIsPlayingAudio(true);
          await playTtsAudio(pendingTtsData);
        } catch (error) {
          console.error('오디오 재생 실패:', error);
        } finally {
          setIsPlayingAudio(false);
        }
        setPendingTtsData(null);
      }
    }
  };

  const handleReportModalClose = () => {
    setShowReportModal(false);
    setReportData(null);
    // 리포트 모달이 닫힌 후 필요한 추가 동작이 있다면 여기에 추가
  };

  const handleKeyboardToggle = () => {
    setIsTextInputMode(!isTextInputMode);
    setTextAnswer('');
  };

  const handleTextSubmit = async () => {
    if (!textAnswer.trim() || !sessionId) return;
    
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
        transcript: textAnswer.trim()
      };

      const response = await submitInterviewTurn(turnData, token);
      
      if (response.code === 200) {
        setTextAnswer('');
        setIsTextInputMode(false);
        
        // 응답 데이터로 상태 업데이트
        setQuestionIntent(response.data.questionIntent);
        setAnswerGuides(response.data.answerGuides);
        setScoreDelta(response.data.scoreDelta);
        setCurrentQuestionIndex(response.data.currentIndex);
        setIsDone(response.data.done);
        
        // Check if interview is done
        if (response.data.done) {
          // Interview finished, finalize report
          try {
            const reportResponse = await finalizeInterviewReport({ sessionId }, token);
            if (reportResponse.code === 200) {
              setReportData(reportResponse.data);
              setShowReportModal(true);
            } else {
              alert('리포트 생성에 실패했습니다: ' + reportResponse.message);
            }
          } catch (error) {
            console.error('Report finalization error:', error);
            alert('인터뷰는 완료되었지만 리포트 생성에 실패했습니다.');
          }
        } else {
          // 코칭 팁이 있으면 모달 표시, 없으면 바로 다음 질문 진행
          if (response.data.coachingTips) {
            setCoachingTips(response.data.coachingTips);
            setPendingNextQuestion(response.data.nextQuestion);
            setPendingTtsData(response.data.tts);
            setShowCoachingModal(true);
          } else {
            // 바로 다음 질문 진행
            setCurrentQuestion(response.data.nextQuestion);
            
            // 다음 질문 오디오 재생
            if (response.data.tts) {
              try {
                setIsPlayingAudio(true);
                await playTtsAudio(response.data.tts);
              } catch (error) {
                console.error('오디오 재생 실패:', error);
              } finally {
                setIsPlayingAudio(false);
              }
            }
          }
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
                  {!isTextInputMode ? (
                    // 음성 입력 모드 - 마이크 + 키보드 버튼
                    <div className={styles.inputButtons}>
                      <button 
                        className={styles.micButton} 
                        onClick={handleMicStart}
                        disabled={isLoading || isPlayingAudio}
                      >
                        <i className="bi bi-mic-fill"></i>
                        <span>
                          {isPlayingAudio ? '재생 중...' :
                           isLoading ? '처리 중...' : 
                           isListening ? '녹음 중지' : '시작'}
                        </span>
                      </button>
                      <button 
                        className={styles.keyboardButton} 
                        onClick={handleKeyboardToggle}
                        disabled={isLoading || isPlayingAudio}
                      >
                        <i className="bi bi-keyboard"></i>
                      </button>
                    </div>
                  ) : (
                    // 텍스트 입력 모드 - 입력창 + X 버튼 + 제출 버튼
                    <div className={styles.textInputContainer}>
                      <input
                        type="text"
                        value={textAnswer}
                        onChange={(e) => setTextAnswer(e.target.value)}
                        className={styles.textInput}
                        placeholder="답변을 입력하세요..."
                        disabled={isLoading}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !isLoading && textAnswer.trim()) {
                            handleTextSubmit();
                          }
                        }}
                      />
                      <button 
                        className={styles.closeButton} 
                        onClick={handleKeyboardToggle}
                        disabled={isLoading}
                      >
                        <i className="bi bi-x-lg"></i>
                      </button>
                      <button 
                        className={styles.submitButton} 
                        onClick={handleTextSubmit}
                        disabled={isLoading || !textAnswer.trim()}
                      >
                        {isLoading ? '처리 중...' : '제출'}
                      </button>
                    </div>
                  )}
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


              </>
            )}
          </div>
        </div>
      </div>
      
      {/* 코칭 팁 모달 */}
      <CoachingModal
        isOpen={showCoachingModal}
        coachingTips={coachingTips}
        onClose={handleCoachingModalClose}
      />
      
      {/* 인터뷰 리포트 모달 */}
      <InterviewReport
        isOpen={showReportModal}
        reportData={reportData}
        onClose={handleReportModalClose}
      />
    </div>
  );
};

export default Interview;