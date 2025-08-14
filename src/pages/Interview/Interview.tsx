import React, { useState, useEffect } from 'react';
import styles from './Interview.module.scss';
import fileUploadIcon from '../../assets/images/file-upload.png';
import geminiIcon from '../../assets/images/gemini-1336519698502187930_128px.png';
import anthropicIcon from '../../assets/images/anthropic (1).svg';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { startInterview } from '../../services/apiService';

const Interview: React.FC = () => {
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [microphonePermission, setMicrophonePermission] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
  const [interviewStarted, setInterviewStarted] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  
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

    // 인터뷰 시작 - 화면 전환
    setInterviewStarted(true);
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
          alert('인터뷰가 처리되었습니다!');
          resetTranscript();
          // 다음 질문으로 이동하는 로직 추가 가능 (더미 데이터 범위 내에서)
          const maxQuestions = 2; // 더미 데이터 개수
          if (currentQuestionIndex < maxQuestions - 1) {
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

  // 더미 데이터
  const dummyQuestions = [
    {
      id: 1,
      question: "프론트엔드 개발자로서 가장 중요하다고 생각하는 역량은 무엇인가요?",
      intent: "프론트엔드 직무에 대한 이해도와 본인이 추구하는 개발 방향성을 파악합니다",
      guidelines: [
        "빠른 변화에 적응하며 최신 프론트엔드 기술을 습득하는 역량이 핵심",
        "사용자 중심의 UI·UX 설계와 구현을 위한 공감 능력과 디테일 추구",
        "협업 툴과 커뮤니케이션을 활용한 원활한 팀 협업 역량이 중요"
      ]
    },
    {
      id: 2,
      question: "최근 진행한 프로젝트에서 어려웠던 기술적 문제와 해결 과정을 설명해주세요.",
      intent: "문제 해결 능력과 기술적 깊이, 학습 능력을 평가합니다",
      guidelines: [
        "구체적인 문제 상황과 원인 분석 과정 설명",
        "해결을 위해 시도한 다양한 접근 방법 제시",
        "최종 해결책과 그를 통해 얻은 학습 경험 공유"
      ]
    }
  ];

  const currentQuestion = dummyQuestions[currentQuestionIndex];

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
                    <span className={styles.questionNumber}>Q{currentQuestion.id}.</span>
                    <div className={styles.questionProgress}>
                      {currentQuestion.id} / {dummyQuestions.length}
                    </div>
                  </div>
                  <div className={styles.questionContent}>
                    <p className={styles.questionText}>{currentQuestion.question}</p>
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
                >
                  시작하기
                </button>
              </>
            ) : (
              // 인터뷰 시작 후 - 답변 가이드 영역
              <>
                <div className={styles.guideHeader}>
                  <img src={anthropicIcon} alt="anthropic" className={styles.guideIcon} />
                  <h3 className={styles.guideTitle}>답변 가이드</h3>
                </div>

                <div className={styles.intentSection}>
                  <div className={styles.intentHeader}>
                    <img src={geminiIcon} alt="gemini" className={styles.intentIcon} />
                    <h4 className={styles.intentTitle}>질문 의도</h4>
                  </div>
                  <p className={styles.intentText}>{currentQuestion.intent}</p>
                </div>

                <div className={styles.guidelinesSection}>
                  <div className={styles.guidelinesHeader}>
                    <img src={geminiIcon} alt="gemini" className={styles.guidelineIcon} />
                    <h4 className={styles.guidelinesTitle}>답변 가이드</h4>
                  </div>
                  <div className={styles.guidelinesList}>
                    {currentQuestion.guidelines.map((guideline, index) => (
                      <div key={index} className={styles.guidelineItem}>
                        {guideline}
                      </div>
                    ))}
                  </div>
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
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Interview;