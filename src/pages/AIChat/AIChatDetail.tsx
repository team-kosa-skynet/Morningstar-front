import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './AIChatDetail.module.scss';
import FeedbackModal from '../../components/Modal/FeedbackModal';
import openAILogo from '../../assets/images/openAI-Photoroom.png';
import geminiLogo from '../../assets/images/gemini-1336519698502187930_128px.png';
import claudeLogo from '../../assets/images/클로드-Photoroom.png';
import { sendChatMessageStream, getConversationDetail, generateImageStream } from '../../services/apiService';
import { useAuthStore } from '../../stores/authStore';

interface Conversation {
  conversationId: number;
  title: string;
  lastModifiedAt: number[];
  messageCount: number;
  lastMessagePreview: string;
}

const AIChatDetail: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuthStore();
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('');
  const [isModelSelectionOpen, setIsModelSelectionOpen] = useState(false);
  const [isModelDetailOpen, setIsModelDetailOpen] = useState(false);
  const [selectedModelBrand, setSelectedModelBrand] = useState('');
  const [isImageMode, setIsImageMode] = useState(searchParams.get('imageMode') === 'true');
  const [isChatInputFocused, setIsChatInputFocused] = useState(false);
  const [, setStreamingMessages] = useState<Record<string, string>>({});
  const [isStreaming, setIsStreaming] = useState<Record<string, boolean>>({});
  const displayedMessagesRef = useRef<Record<string, string>>({});
  const typingStateRef = useRef<Record<string, { isTyping: boolean; currentIndex: number; targetText: string; lastUpdateTime: number; animationId: NodeJS.Timeout | number | null }>>({});
  const [, setForceUpdateCounter] = useState(0);
  const forceUpdate = () => setForceUpdateCounter(prev => prev + 1);
  const textBuffersRef = useRef<Record<string, string>>({});
  const streamStartTimeRef = useRef<Record<string, number>>({});
  
  // URL 파라미터에서 conversationId와 질문 가져오기
  const conversationId = parseInt(searchParams.get('conversationId') || '0');
  const [currentQuestion, setCurrentQuestion] = useState(
    searchParams.get('question') || '각자 자신의 모델에 대해 소개한번만 부탁해'
  );
  const [isLoadingExistingConversation, setIsLoadingExistingConversation] = useState(false);
  interface Message {
    messageId: number;
    content: string;
    role: 'user' | 'assistant';
    aiModel?: string;
    messageOrder: number;
    createdAt: string;
    attachments: unknown[];
  }
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const chatInputRef = useRef<HTMLDivElement>(null);
  const [feedbackModal, setFeedbackModal] = useState<{
    isOpen: boolean;
    selectedModel: { name: string; icon: string; value?: string };
    unselectedModel: { name: string; icon: string; value?: string };
  }>({
    isOpen: false,
    selectedModel: { name: '', icon: '', value: '' },
    unselectedModel: { name: '', icon: '', value: '' }
  });
  
  // 피드백 제출된 모델 추적 (메시지ID로 관리)
  const [feedbackSubmittedMessages, setFeedbackSubmittedMessages] = useState<Set<number>>(new Set());

  const [selectedModels, setSelectedModels] = useState<Array<{id: string, name: string, icon: string, brand: string}>>([]);
  
  // 이전 대화 관련 상태
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  // 버튼 클릭 시 포커스 해제 방지
  const [isInteractingWithButtons, setIsInteractingWithButtons] = useState(false);

  const models = [
    { id: 'gpt', name: 'GPT by OpenAI', icon: openAILogo },
    { id: 'gemini', name: 'Gemini by Google', icon: geminiLogo },
    { id: 'claude', name: 'Claude by Anthropic', icon: claudeLogo }
  ];

  // AI 모델 정보 로딩
  const [modelInfoData, setModelInfoData] = useState<any>(null);
  const [modelInfoLoading, setModelInfoLoading] = useState(false);

  // API 데이터를 기반으로 모델 세부 리스트 생성
  const getModelDetails = (): Record<string, Array<{id: string, name: string, icon: string}>> => {
    if (!modelInfoData) {
      // API 데이터가 없을 때 기본 모델들
      return {
        gpt: [
          { id: 'gpt-4o', name: 'GPT-4o', icon: openAILogo },
          { id: 'gpt-4o-mini', name: 'GPT-4o mini', icon: openAILogo },
          { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', icon: openAILogo },
          { id: 'gpt-4', name: 'GPT-4', icon: openAILogo },
          { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', icon: openAILogo },
          { id: 'o1-preview', name: 'OpenAI o1-preview', icon: openAILogo },
          { id: 'o1-mini', name: 'OpenAI o1-mini', icon: openAILogo }
        ],
        gemini: [
          { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', icon: geminiLogo },
          { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', icon: geminiLogo },
          { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', icon: geminiLogo },
          { id: 'gemini-pro', name: 'Gemini Pro', icon: geminiLogo }
        ],
        claude: [
          { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', icon: claudeLogo },
          { id: 'claude-3.5-haiku', name: 'Claude 3.5 Haiku', icon: claudeLogo },
          { id: 'claude-3-opus', name: 'Claude 3 Opus', icon: claudeLogo },
          { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', icon: claudeLogo }
        ]
      };
    }

    const details: Record<string, Array<{id: string, name: string, icon: string}>> = {};

    // OpenAI 모델들
    if (modelInfoData.openai) {
      let openaiModels = modelInfoData.openai.models;
      // 이미지 모드일 때 isCreateImage가 true인 모델만 필터링
      if (isImageMode) {
        openaiModels = openaiModels.filter((model: any) => model.isCreateImage === true);
      }
      details.gpt = openaiModels.map((model: any) => ({
        id: model.name,
        name: model.name.toUpperCase(),
        icon: openAILogo
      }));
    }

    // Gemini 모델들
    if (modelInfoData.gemini) {
      let geminiModels = modelInfoData.gemini.models;
      // 이미지 모드일 때 isCreateImage가 true인 모델만 필터링
      if (isImageMode) {
        geminiModels = geminiModels.filter((model: any) => model.isCreateImage === true);
      }
      details.gemini = geminiModels.map((model: any) => ({
        id: model.name,
        name: model.name.charAt(0).toUpperCase() + model.name.slice(1).replace(/-/g, ' '),
        icon: geminiLogo
      }));
    }

    // Claude 모델들
    if (modelInfoData.claude) {
      let claudeModels = modelInfoData.claude.models;
      // 이미지 모드일 때 isCreateImage가 true인 모델만 필터링
      if (isImageMode) {
        claudeModels = claudeModels.filter((model: any) => model.isCreateImage === true);
      }
      details.claude = claudeModels.map((model: any) => ({
        id: model.name,
        name: model.name.charAt(0).toUpperCase() + model.name.slice(1).replace(/-/g, ' '),
        icon: claudeLogo
      }));
    }

    return details;
  };

  const modelDetails = useMemo(() => getModelDetails(), [modelInfoData, isImageMode]);

  const handleLike = (selectedModelId: string, messageId: number) => {
    // 이미 피드백을 제출한 메시지인지 확인
    if (feedbackSubmittedMessages.has(messageId)) {
      alert('이미 피드백을 제출하셨습니다.');
      return;
    }
    
    console.log('handleLike called with:', selectedModelId, messageId);
    console.log('Current allMessages:', allMessages);
    
    // 클릭한 메시지 찾기
    const clickedMessage = allMessages.find(m => m.messageId === messageId);
    if (!clickedMessage) {
      console.error('Clicked message not found');
      return;
    }
    
    console.log('Clicked message:', clickedMessage);
    
    // 같은 user 질문에 대한 모든 assistant 응답 찾기
    // 방법: 클릭한 메시지의 messageOrder를 기준으로 가장 가까운 이전 user 메시지를 찾고,
    // 그 다음 user 메시지가 나오기 전까지의 모든 assistant 메시지를 찾기
    
    const clickedOrder = clickedMessage.messageOrder;
    
    // 현재 메시지 이전의 가장 가까운 user 메시지 찾기
    const previousUserMessage = allMessages
      .filter(msg => msg.role === 'user' && msg.messageOrder < clickedOrder)
      .sort((a, b) => b.messageOrder - a.messageOrder)[0];
    
    // 다음 user 메시지 찾기 (있다면)
    const nextUserMessage = allMessages
      .filter(msg => msg.role === 'user' && msg.messageOrder > clickedOrder)
      .sort((a, b) => a.messageOrder - b.messageOrder)[0];
    
    console.log('Previous user message:', previousUserMessage);
    console.log('Next user message:', nextUserMessage);
    
    // 같은 질문에 대한 모든 assistant 응답 찾기
    const currentGroupMessages = allMessages.filter(msg => {
      if (msg.role !== 'assistant') return false;
      
      const msgOrder = msg.messageOrder;
      const afterPrevUser = !previousUserMessage || msgOrder > previousUserMessage.messageOrder;
      const beforeNextUser = !nextUserMessage || msgOrder < nextUserMessage.messageOrder;
      
      return afterPrevUser && beforeNextUser;
    });
    
    console.log('Current group messages:', currentGroupMessages);
    console.log('Number of AI responses in this group:', currentGroupMessages.length);
    
    // 선택한 모델과 선택하지 않은 모델 찾기
    const selectedMessage = currentGroupMessages.find(msg => msg.messageId === messageId);
    const unselectedMessage = currentGroupMessages.find(msg => msg.messageId !== messageId);
    
    if (selectedMessage && unselectedMessage) {
      // 모델 아이콘과 표시 이름 결정
      const getModelInfo = (modelId: string) => {
        let icon = openAILogo;
        let displayName = modelId;
        
        if (modelId.toLowerCase().includes('claude')) {
          icon = claudeLogo;
          displayName = modelId.replace(/claude-/g, 'Claude ').replace(/\b\w/g, l => l.toUpperCase());
        } else if (modelId.toLowerCase().includes('gemini')) {
          icon = geminiLogo;
          displayName = modelId.replace(/gemini-/g, 'Gemini ').replace(/\b\w/g, l => l.toUpperCase());
        } else if (modelId.toLowerCase().includes('gpt') || modelId.toLowerCase().includes('o1')) {
          icon = openAILogo;
          displayName = modelId.toUpperCase();
        }
        
        return { icon, displayName };
      };
      
      const selectedInfo = getModelInfo(selectedMessage.aiModel || '');
      const unselectedInfo = getModelInfo(unselectedMessage.aiModel || '');
      
      setFeedbackModal({
        isOpen: true,
        selectedModel: { 
          name: selectedInfo.displayName, 
          icon: selectedInfo.icon,
          value: selectedMessage.aiModel || '' // 실제 모델 ID
        },
        unselectedModel: { 
          name: unselectedInfo.displayName, 
          icon: unselectedInfo.icon,
          value: unselectedMessage.aiModel || '' // 실제 모델 ID
        }
      });
      
      // 현재 피드백 중인 메시지 ID 저장 (제출 성공 시 처리용)
      sessionStorage.setItem('currentFeedbackMessageId', messageId.toString());
    } else {
      console.log('Could not find both selected and unselected models');
      alert('비교할 다른 모델의 응답이 없습니다.');
    }
  };

  const closeFeedbackModal = () => {
    setFeedbackModal({
      ...feedbackModal,
      isOpen: false
    });
    // 피드백 모달 닫을 때 임시 저장한 메시지 ID 제거
    sessionStorage.removeItem('currentFeedbackMessageId');
  };
  
  const handleFeedbackSuccess = () => {
    // 피드백 제출 성공 시 해당 메시지를 제출된 목록에 추가
    const messageId = sessionStorage.getItem('currentFeedbackMessageId');
    if (messageId) {
      setFeedbackSubmittedMessages(prev => new Set(prev).add(parseInt(messageId)));
      sessionStorage.removeItem('currentFeedbackMessageId');
    }
  };

  const handleModelSelect = (modelId: string) => {
    setSelectedModelBrand(modelId);
    setIsModelSelectionOpen(false);
    setIsModelDetailOpen(true);
  };

  const handleModelDetailSelect = (modelId: string) => {
    const selectedModelData = modelDetails[selectedModelBrand]?.find(model => model.id === modelId);
    if (selectedModelData) {
      const newSelectedModel = {
        ...selectedModelData,
        brand: selectedModelBrand
      };
      
      // 중복 체크 및 최대 2개 제한
      const isAlreadySelected = selectedModels.some(model => model.id === modelId);
      if (!isAlreadySelected && selectedModels.length < 2) {
        setSelectedModels(prev => [...prev, newSelectedModel]);
      }
    }
    setIsModelDetailOpen(false);
    
    // 메시지가 없으면 포커스 해제
    if (!message.trim()) {
      setIsChatInputFocused(false);
    }
  };

  const handleRemoveModel = (modelId: string) => {
    setSelectedModels(prev => prev.filter(model => model.id !== modelId));
  };

  const handleBackToModelSelection = () => {
    setIsModelDetailOpen(false);
    setIsModelSelectionOpen(true);
  };

  // 이전 대화 목록 가져오기
  const fetchConversations = async () => {
    if (!token) return;
    
    try {
      setHistoryLoading(true);
      const response = await axios.get('https://gaebang.site/api/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.code === 200 && response.data.data?.conversations) {
        setConversations(response.data.data.conversations);
      }
    } catch (error) {
      console.error('이전 대화 목록 조회 오류:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  // 이전 대화 버튼 클릭 핸들러
  const handleHistoryToggle = () => {
    if (!isHistoryOpen && conversations.length === 0) {
      fetchConversations();
    }
    setIsHistoryOpen(!isHistoryOpen);
  };

  // 대화 삭제 핸들러
  const handleDeleteConversation = async (conversationId: number) => {
    if (!token) return;
    
    if (!confirm('이 대화를 삭제하시겠습니까?')) {
      return;
    }
    
    try {
      const response = await axios.delete(`https://gaebang.site/api/conversations/${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data.code === 200) {
        // 삭제 성공 시 목록에서 제거
        setConversations(prev => prev.filter(conv => conv.conversationId !== conversationId));
      } else {
        alert('대화 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('대화 삭제 오류:', error);
      alert('대화 삭제 중 오류가 발생했습니다.');
    }
  };

  // 텍스트 포맷팅 함수 (코드 블록 및 bold 처리)
  const formatText = (text: string) => {
    if (!text) return text;
    
    // 이미 HTML 태그가 포함된 경우 (이미지 등) 그대로 반환
    if (text.includes('<img') || text.includes('<div')) {
      return text;
    }
    
    let formattedText = text;
    
    // 코드 블록 처리 (```language\ncontent\n```)
    const codeBlockPattern = /```([\s\S]*?)```/g;
    formattedText = formattedText.replace(codeBlockPattern, (_, content) => {
      // 코드 내용에서 언어와 실제 코드 분리
      const lines = content.trim().split('\n');
      lines[0].trim();
      const codeContent = lines.length > 1 ? lines.slice(1).join('\n') : lines[0];
      
      return `<div class="code-block">
        <pre><code>${codeContent}</code></pre>
      </div>`;
    });
    
    // 인라인 코드 처리 (`code`)
    const inlineCodePattern = /`([^`]+)`/g;
    formattedText = formattedText.replace(inlineCodePattern, '<code class="inline-code">$1</code>');
    
    // **텍스트** 패턴을 찾아서 <strong> 태그로 변환
    const boldPattern = /\*\*(.*?)\*\*/g;
    formattedText = formattedText.replace(boldPattern, '<strong>$1</strong>');
    
    return formattedText;
  };

  // 타이핑 효과 함수 - requestAnimationFrame 사용하여 개선
  const typeWriter = useCallback((modelName: string, newFullText: string) => {
    const speed = 30; // 타이핑 속도 (ms)
    
    console.log(`[${modelName}] typeWriter 호출:`, newFullText.length, '글자');
    
    // 현재 상태 확인 또는 초기화
    if (!typingStateRef.current[modelName]) {
      typingStateRef.current[modelName] = {
        isTyping: false,
        currentIndex: 0,
        targetText: '',
        lastUpdateTime: Date.now(),
        animationId: null
      };
    }
    
    const currentState = typingStateRef.current[modelName];
    
    // 타겟 텍스트만 업데이트 (타이핑은 중단하지 않음)
    currentState.targetText = newFullText;
    currentState.lastUpdateTime = Date.now();
    
    // 이미 타이핑 중이라면 새로운 타이핑을 시작하지 않음
    if (currentState.isTyping) {
      console.log(`[${modelName}] 이미 타이핑 중 - 타겟만 업데이트`);
      return;
    }
    
    // 타이핑 시작
    currentState.isTyping = true;
    console.log(`[${modelName}] 새 타이핑 시작 - 현재:`, currentState.currentIndex, '목표:', newFullText.length);
    
    const type = () => {
      const state = typingStateRef.current[modelName];
      if (!state || !state.isTyping) {
        console.log(`[${modelName}] 타이핑 중단 - 상태:`, state);
        return;
      }
      
      const targetText = state.targetText;
      console.log(`[${modelName}] 타이핑 진행 - 현재: ${state.currentIndex}, 타겟: ${targetText.length}`);
      
      if (state.currentIndex < targetText.length) {
        const nextChar = targetText.slice(0, state.currentIndex + 1);
        
        // ref 업데이트 및 강제 리렌더링
        displayedMessagesRef.current[modelName] = nextChar;
        forceUpdate();
        
        state.currentIndex++;
        
        // 다음 타이핑을 위한 타이머 설정
        const timeoutId = setTimeout(type, speed);
        // 타이핑 상태에 타이머 ID 저장 (취소를 위해)
        state.animationId = timeoutId;
      } else {
        // 타이핑 완료
        console.log(`[${modelName}] 타이핑 완료 - 최종 텍스트: "${state.targetText}"`);
        state.isTyping = false;
        if (state.animationId) {
          clearTimeout(state.animationId);
          state.animationId = null;
        }
      }
    };
    
    // 타이핑 시작
    type();
    
    // 5초 후에도 타이핑이 완료되지 않으면 강제 완료 (안전장치)
    setTimeout(() => {
      const state = typingStateRef.current[modelName];
      if (state && state.isTyping && state.currentIndex < state.targetText.length) {
        console.warn(`[${modelName}] 5초 타임아웃 - 남은 텍스트를 즉시 표시`);
        displayedMessagesRef.current[modelName] = state.targetText;
        forceUpdate();
        state.isTyping = false;
        state.currentIndex = state.targetText.length;
        if (state.animationId) {
          clearTimeout(state.animationId);
          state.animationId = null;
        }
      }
    }, 5000);
  }, []);

  const startStreaming = useCallback(async (questionText: string) => {
    if (!questionText.trim() || !token || !conversationId) {
      console.log('Missing required data for streaming:', { questionText, token: !!token, conversationId });
      return;
    }

    console.log('Starting streaming with:', { questionText, conversationId });
    console.log('현재 selectedModels:', selectedModels);

    // 스트리밍 시작 시간을 기록하여 고유 식별자로 사용
    const streamingStartTime = Date.now();
    
    // AI 메시지들을 allMessages에 추가
    setAllMessages(prevMessages => {
      // 현재 최대 messageOrder 계산 (최신 상태 기준)
      const currentMaxOrder = Math.max(...prevMessages.map(m => m.messageOrder), 0);
      
      const newAIMessages: Message[] = selectedModels.map((model, index) => ({
        messageId: streamingStartTime * 1000 + index, // 더 큰 범위로 고유 ID 생성 (밀리초 * 1000 + 인덱스)
        content: '',
        role: 'assistant' as const,
        aiModel: model.id,
        messageOrder: currentMaxOrder + 1 + index, // 각 AI 메시지마다 다른 messageOrder
        createdAt: new Date().toISOString(),
        attachments: []
      }));
      
      return [...prevMessages, ...newAIMessages];
    });

    // 선택된 모델들로 스트리밍 상태 초기화
    const initialStreaming: Record<string, boolean> = {};
    const initialMessages: Record<string, string> = {};
    const initialBuffers: Record<string, string> = {};
    const initialDisplayed: Record<string, string> = {};
    
    selectedModels.forEach(model => {
      initialStreaming[model.name] = true;
      initialMessages[model.name] = '';
      initialBuffers[model.name] = '';
      initialDisplayed[model.name] = '';
      // ref 초기화
      displayedMessagesRef.current[model.name] = '';
      typingStateRef.current[model.name] = { 
        isTyping: false, 
        currentIndex: 0, 
        targetText: '',
        lastUpdateTime: Date.now(),
        animationId: null
      };
      textBuffersRef.current[model.name] = '';
    });

    setIsStreaming(initialStreaming);
    setStreamingMessages(initialMessages);

    // 선택된 모델들에 대해 동시에 스트리밍 시작
    const promises = selectedModels.map(async (model) => {
      try {
        const provider = model.brand === 'gpt' ? 'openai' : model.brand as 'openai' | 'claude' | 'gemini';
        
        // 스트림 시작 시간 기록
        streamStartTimeRef.current[model.name] = Date.now();
        console.log(`[${model.name}] ${isImageMode ? '이미지 생성' : '스트림'} 시작:`, new Date().toISOString());
        
        // 이미지 모드인 경우 이미지 생성 API 사용
        if (isImageMode) {
          // 모델에 따라 올바른 provider 결정
          let imageProvider: 'openai' | 'gemini';
          if (model.id.includes('dall-e') || model.brand === 'gpt') {
            imageProvider = 'openai';
          } else if (model.id.includes('imagen') || model.brand === 'gemini') {
            imageProvider = 'gemini';
          } else {
            // 기본값은 모델의 브랜드 사용
            imageProvider = model.brand === 'gpt' ? 'openai' : 'gemini';
          }
          
          console.log(`[${model.name}] 모델-프로바이더 매칭:`, {
            modelId: model.id,
            modelBrand: model.brand,
            provider: imageProvider
          });
          
          return generateImageStream(
            conversationId,
            imageProvider,
            { 
              prompt: questionText, 
              model: model.id 
            },
            token,
            (imageUrl: string) => {
              console.log(`[${model.name}] 이미지 수신:`, imageUrl);
              
              // base64 이미지 URL을 HTML img 태그로 표시
              const imageContent = `<div style="width: 100%; margin: 0;">
                <img src="${imageUrl}" alt="Generated Image" style="width: 100%; height: auto; border-radius: 8px; display: block;" />
              </div>`;
              
              textBuffersRef.current[model.name] = imageContent;
              
              // allMessages 배열의 해당 AI 메시지 업데이트
              const targetMessageId = streamingStartTime * 1000 + selectedModels.findIndex(m => m.id === model.id);
              setAllMessages(prev => prev.map(msg => 
                msg.messageId === targetMessageId
                  ? { ...msg, content: imageContent }
                  : msg
              ));
              
              // 즉시 표시 (타이핑 효과 없이)
              displayedMessagesRef.current[model.name] = imageContent;
              forceUpdate();
            },
            () => {
              console.log(`[${model.name}] 이미지 생성 완료`);
              setIsStreaming(prev => ({ ...prev, [model.name]: false }));
            },
            (error) => {
              console.error(`[${model.name}] 이미지 생성 오류:`, error);
              const errorContent = '이미지 생성 중 오류가 발생했습니다.';
              textBuffersRef.current[model.name] = errorContent;
              
              // 에러 메시지 표시
              const targetMessageId = streamingStartTime * 1000 + selectedModels.findIndex(m => m.id === model.id);
              setAllMessages(prev => prev.map(msg => 
                msg.messageId === targetMessageId
                  ? { ...msg, content: errorContent }
                  : msg
              ));
              
              displayedMessagesRef.current[model.name] = errorContent;
              forceUpdate();
              setIsStreaming(prev => ({ ...prev, [model.name]: false }));
            },
            (text: string) => {
              // 진행 상황 텍스트 메시지 처리
              console.log(`[${model.name}] 진행 상황:`, text);
              
              // 진행 상황을 임시로 표시
              const currentBuffer = textBuffersRef.current[model.name] || '';
              const progressText = currentBuffer || text;
              
              // 타이핑 효과로 진행 상황 표시
              typeWriter(model.name, progressText);
            }
          );
        }
        
        // 일반 채팅 모드 - 기존 스트리밍 로직
        return sendChatMessageStream(
          conversationId,
          provider,
          { content: questionText, model: model.id },
          token,
          (text: string) => {
            const elapsed = Date.now() - streamStartTimeRef.current[model.name];
            console.log(`[${model.name}] SSE 수신 (${elapsed}ms):`, text);
            // ref를 직접 업데이트 (동기적, 경쟁 조건 방지)
            const currentBuffer = textBuffersRef.current[model.name] || '';
            textBuffersRef.current[model.name] = currentBuffer + text;
            const newBuffer = textBuffersRef.current[model.name];
            console.log(`[${model.name}] 버퍼 업데이트:`, newBuffer.length, '글자');
            
            // allMessages 배열의 해당 AI 메시지 업데이트 (고유 ID로 찾기)
            const targetMessageId = streamingStartTime * 1000 + selectedModels.findIndex(m => m.id === model.id);
            setAllMessages(prev => prev.map(msg => 
              msg.messageId === targetMessageId
                ? { ...msg, content: newBuffer }
                : msg // 다른 메시지들은 기존 객체 참조를 유지하여 불필요한 리렌더링 방지
            ));
            
            // 타이핑 효과로 표시
            typeWriter(model.name, newBuffer);
          },
          () => {
            const elapsed = Date.now() - streamStartTimeRef.current[model.name];
            const totalChars = textBuffersRef.current[model.name]?.length || 0;
            console.log(`[${model.name}] SSE 스트림 완료 - ${elapsed}ms, ${totalChars}글자`);
            setIsStreaming(prev => ({ ...prev, [model.name]: false }));
          },
          (error) => {
            console.error(`${model.name} streaming error:`, error);
            setIsStreaming(prev => ({ ...prev, [model.name]: false }));
            
            // 스트림 중단 시 현재까지 받은 텍스트를 즉시 표시
            const currentBuffer = textBuffersRef.current[model.name];
            if (currentBuffer) {
              console.warn(`[${model.name}] 스트림 에러 - 현재 버퍼 내용을 즉시 표시:`, currentBuffer);
              displayedMessagesRef.current[model.name] = currentBuffer;
              forceUpdate();
              
              // 타이핑 상태 정리
              const typingState = typingStateRef.current[model.name];
              if (typingState) {
                typingState.isTyping = false;
                typingState.targetText = currentBuffer;
                typingState.currentIndex = currentBuffer.length;
                if (typingState.animationId) {
                  clearTimeout(typingState.animationId);
                  typingState.animationId = null;
                }
              }
            }
          }
        );
      } catch (error) {
        console.error(`${model.name} error:`, error);
        setIsStreaming(prev => ({ ...prev, [model.name]: false }));
        throw error;
      }
    });

    // 백그라운드에서 스트리밍 처리 (페이지는 즉시 사용 가능)
    Promise.allSettled(promises).then(() => {
      console.log('All streaming completed');
    });
  }, [conversationId, token, selectedModels, typeWriter, isImageMode]);

  const handleSubmit = async () => {
    if (!message.trim()) {
      return;
    }

    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }

    const currentMessage = message;
    setCurrentQuestion(currentMessage);
    setMessage('');
    
    // 새 유저 메시지를 allMessages 배열에 추가
    const newUserMessage: Message = {
      messageId: Date.now(), // 임시 ID
      content: currentMessage,
      role: 'user',
      messageOrder: Math.max(...allMessages.map(m => m.messageOrder), 0) + 1,
      createdAt: new Date().toISOString(),
      attachments: []
    };
    
    setAllMessages(prev => [...prev, newUserMessage]);
    
    await startStreaming(currentMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // 채팅 입력창 높이 계산 및 CSS 변수 업데이트
  const updateChatInputHeight = () => {
    if (chatInputRef.current) {
      const height = chatInputRef.current.offsetHeight;
      const bottomMargin = 20; // 채팅창의 bottom 여백
      const modalGap = 20; // 모달과 채팅창 사이 간격
      const totalHeight = height + bottomMargin + modalGap;
      
      document.documentElement.style.setProperty('--chat-input-height', `${totalHeight}px`);
      console.log('Chat input height updated:', height, 'Total:', totalHeight); // 디버깅용
    }
  };

  // selectedModels가 변경될 때마다 높이 재계산
  useEffect(() => {
    updateChatInputHeight();
  }, [selectedModels]);

  // isChatInputFocused가 변경될 때마다 높이 재계산
  useEffect(() => {
    // 약간의 지연을 두어 DOM 업데이트 후 높이 계산
    setTimeout(() => {
      updateChatInputHeight();
    }, 50);
  }, [isChatInputFocused]);

  // 컴포넌트 마운트 시 초기 높이 설정 및 ResizeObserver 설정
  useEffect(() => {
    updateChatInputHeight();
    
    // ResizeObserver로 채팅 입력창 크기 변화 감지
    if (chatInputRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        updateChatInputHeight();
      });
      
      resizeObserver.observe(chatInputRef.current);
      
      return () => {
        resizeObserver.disconnect();
      };
    }
  }, []);

  // AI 모델 정보 로딩
  useEffect(() => {
    const fetchModelInfo = async () => {
      try {
        setModelInfoLoading(true);
        const response = await axios.get('https://gaebang.site/api/models/info');
        
        if (response.data.code === 200 && response.data.data) {
          setModelInfoData(response.data.data);
        }
      } catch (err) {
        console.error('모델 정보 API 호출 오류:', err);
      } finally {
        setModelInfoLoading(false);
      }
    };

    fetchModelInfo();
  }, []);

  // ESC 키로 모달 닫기
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isModelDetailOpen) {
          setIsModelDetailOpen(false);
        } else if (isModelSelectionOpen) {
          setIsModelSelectionOpen(false);
        } else if (isHistoryOpen) {
          setIsHistoryOpen(false);
        }
        
        // 메시지가 없으면 포커스 해제
        if (!message.trim()) {
          setIsChatInputFocused(false);
        }
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isModelSelectionOpen, isModelDetailOpen, isHistoryOpen, message]);

  // 컴포넌트 언마운트 시 타이핑 애니메이션 정리
  useEffect(() => {
    return () => {
      Object.keys(typingStateRef.current).forEach(modelName => {
        const state = typingStateRef.current[modelName];
        if (state?.animationId) {
          clearTimeout(state.animationId);
        }
      });
    };
  }, []);

  // 메시지를 그룹핑하는 함수 (유저 메시지 + 연속된 AI 답변들)
  const groupMessagesByOrder = (messages: Message[]) => {
    const groups: Array<{userMessage: Message | null, aiMessages: Message[]}> = [];
    
    // messageOrder로 정렬
    const sortedMessages = [...messages].sort((a, b) => a.messageOrder - b.messageOrder);
    
    let currentGroup: {userMessage: Message | null, aiMessages: Message[]} | null = null;
    let seenUserMessages = new Set<string>(); // messageOrder + content로 중복 체크
    
    sortedMessages.forEach(message => {
      if (message.role === 'user') {
        // 같은 messageOrder와 content의 유저 메시지가 이미 처리되었으면 무시 (중복 방지)
        const userKey = `${message.messageOrder}-${message.content}`;
        if (seenUserMessages.has(userKey)) {
          return;
        }
        
        // 새로운 유저 메시지를 만나면 이전 그룹을 완료하고 새 그룹 시작
        if (currentGroup) {
          groups.push(currentGroup);
        }
        
        seenUserMessages.add(userKey);
        currentGroup = {
          userMessage: message,
          aiMessages: []
        };
      } else if (message.role === 'assistant' && currentGroup) {
        // 현재 그룹에 AI 답변 추가
        currentGroup.aiMessages.push(message);
      } else if (message.role === 'assistant' && !currentGroup) {
        // 유저 메시지 없이 AI 답변만 있는 경우 (첫 번째 그룹에서 발생할 수 있음)
        currentGroup = {
          userMessage: null,
          aiMessages: [message]
        };
      }
    });
    
    // 마지막 그룹 추가
    if (currentGroup) {
      groups.push(currentGroup);
    }
    
    // console.log('Grouped messages:', groups.length, 'groups'); // 디버깅용
    return groups;
  };

  // 기존 대화 로드 함수
  const loadExistingConversation = useCallback(async () => {
    if (!conversationId || !token) return;

    try {
      setIsLoadingExistingConversation(true);
      const response = await getConversationDetail(conversationId, token);
      
      if (response.code === 200) {
        const { data } = response;
        setCurrentQuestion(data.title);
        
        // 메시지 정렬
        const sortedMessages = (data.messages || [])
          .sort((a: Message, b: Message) => a.messageOrder - b.messageOrder);
        
        setAllMessages(sortedMessages);
        
        // 메시지가 있는 경우 실제 사용된 모델들을 추출하여 selectedModels 설정
        if (data.messages && data.messages.length > 0) {
          const usedModels = new Map();
          
          // 메시지에서 실제 사용된 AI 모델들을 추출
          data.messages.forEach((msg: Message) => {
            if (msg.role === 'assistant' && msg.aiModel) {
              const modelId = msg.aiModel;
              let brand = 'openai';
              let name = modelId;
              let icon = openAILogo;
              
              // 모델 이름으로 브랜드 판별
              if (modelId.toLowerCase().includes('claude')) {
                brand = 'claude';
                icon = claudeLogo;
                name = modelId.replace(/claude-/g, 'Claude ').replace(/\b\w/g, l => l.toUpperCase());
              } else if (modelId.toLowerCase().includes('gemini')) {
                brand = 'gemini';
                icon = geminiLogo;
                name = modelId.replace(/gemini-/g, 'Gemini ').replace(/\b\w/g, l => l.toUpperCase());
              } else if (modelId.toLowerCase().includes('gpt')) {
                brand = 'gpt';
                icon = openAILogo;
                name = modelId.toUpperCase();
              }
              
              usedModels.set(modelId, {
                id: modelId,
                name: name,
                icon: icon,
                brand: brand
              });
            }
          });
          
          // 추출된 모델들을 selectedModels로 설정
          const extractedModels = Array.from(usedModels.values());
          if (extractedModels.length > 0) {
            setSelectedModels(extractedModels);
          } else {
            // 추출된 모델이 없는 경우 기본 모델 설정
            const defaultModels = [
              {
                id: 'gpt-4o',
                name: 'GPT-4o',
                icon: openAILogo,
                brand: 'gpt'
              }
            ];
            setSelectedModels(defaultModels);
          }
        } else {
          // 메시지가 없는 새로운 대화인 경우 기본 모델 설정
          const defaultModels = [
            {
              id: 'gpt-4o',
              name: 'GPT-4o',
              icon: openAILogo,
              brand: 'gpt'
            },
            {
              id: 'claude-3.5-sonnet',
              name: 'Claude 3.5 Sonnet',
              icon: claudeLogo,
              brand: 'claude'
            }
          ];
          setSelectedModels(defaultModels);
        }
      }
    } catch (error) {
      console.error('기존 대화 로드 오류:', error);
    } finally {
      setIsLoadingExistingConversation(false);
    }
  }, [conversationId, token]);

  // URL 파라미터에서 선택된 모델들 가져오기 또는 기존 대화 로드
  useEffect(() => {
    const questionParam = searchParams.get('question');
    const modelsParam = searchParams.get('models');
    
    // 새로운 대화인 경우 (question이 있고 models이 있는 경우)
    if (questionParam && modelsParam) {
      try {
        const decodedModels = decodeURIComponent(modelsParam);
        console.log('URL에서 받은 models 파라미터:', decodedModels);
        
        const parsedModels = decodedModels.split(',').map(modelStr => {
          const parts = modelStr.split(':');
          const [id, name, receivedBrand] = parts;
          // 이미지 모드일 때 ':image'가 추가되므로 이를 무시
          
          // 모델 ID를 기반으로 올바른 브랜드 결정 (URL에서 온 브랜드가 잘못될 수 있음)
          let correctBrand = receivedBrand;
          if (id.includes('dall-e') || id.includes('gpt')) {
            correctBrand = 'gpt';
          } else if (id.includes('imagen') || id.includes('gemini')) {
            correctBrand = 'gemini';
          } else if (id.includes('claude')) {
            correctBrand = 'claude';
          }
          
          // 브랜드에 따른 아이콘 설정
          let icon = openAILogo;
          if (correctBrand === 'claude') icon = claudeLogo;
          else if (correctBrand === 'gemini') icon = geminiLogo;
          
          const model = { id, name, icon, brand: correctBrand };
          console.log('파싱된 모델 (브랜드 수정):', model);
          console.log('원본 브랜드:', receivedBrand, '→ 수정된 브랜드:', correctBrand);
          return model;
        });
        
        setSelectedModels(parsedModels);
        console.log('설정된 selectedModels:', parsedModels);
      } catch (error) {
        console.error('Error parsing models from URL:', error);
        // 파싱 실패 시 기본 모델 설정
        setSelectedModels([
          { id: 'gpt-4o', name: 'GPT-4o', icon: openAILogo, brand: 'gpt' },
          { id: 'claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', icon: claudeLogo, brand: 'claude' }
        ]);
      }
    }
    // 기존 대화인 경우 (question과 models가 없는 경우)
    else if (conversationId && token) {
      loadExistingConversation();
    }
  }, [searchParams, conversationId, token, loadExistingConversation]);

  // 페이지 로드 시 자동으로 스트리밍 시작 (새로운 대화인 경우에만)
  useEffect(() => {
    const questionParam = searchParams.get('question');
    
    // 새로운 대화인 경우에만 자동 스트리밍 시작
    if (conversationId && token && currentQuestion && selectedModels.length > 0 && questionParam && allMessages.length === 0 && !isLoadingExistingConversation) {
      console.log('Auto-starting stream with conversationId:', conversationId);
      
      // 유저 메시지를 먼저 allMessages에 추가
      const newUserMessage: Message = {
        messageId: Date.now(), // 임시 ID
        content: currentQuestion,
        role: 'user',
        messageOrder: 1, // 새로운 대화이므로 1부터 시작
        createdAt: new Date().toISOString(),
        attachments: []
      };
      
      setAllMessages(prev => [...prev, newUserMessage]);
      
      // 스트리밍 시작
      startStreaming(currentQuestion);
    }
  }, [conversationId, token, currentQuestion, selectedModels, searchParams, allMessages, isLoadingExistingConversation, startStreaming]);

  // 컴포넌트 언마운트 시 타이핑 애니메이션 정리
  useEffect(() => {
    return () => {
      // 모든 모델의 애니메이션 정리
      Object.keys(typingStateRef.current).forEach(modelName => {
        const state = typingStateRef.current[modelName];
        if (state?.animationId) {
          clearTimeout(state.animationId);
          state.animationId = null;
        }
        if (state) {
          state.isTyping = false;
        }
      });
      
      // 추가 정리는 위에서 이미 처리됨
    };
  }, []);

  // 메시지 그룹핑 결과를 메모이제이션
  const messageGroups = useMemo(() => {
    return groupMessagesByOrder(allMessages);
  }, [allMessages]);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        {/* 로딩 상태 표시 */}
        {isLoadingExistingConversation && (
          <div className={styles.messageHistory}>
            <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
              대화를 불러오는 중...
            </div>
          </div>
        )}

        {/* 모든 대화 메시지들을 그룹별로 통합 표시 */}
        {!isLoadingExistingConversation && (
          <div className={styles.messageHistory}>
            {messageGroups.map((group, groupIndex) => {
              const isLastGroup = groupIndex === messageGroups.length - 1;
              
              return (
                <div key={`group-${groupIndex}`} className={styles.messageGroup}>
                  {/* 유저 메시지 */}
                  {group.userMessage && (
                    <div className={styles.messageSection}>
                      <div className={styles.userMessageContainer}>
                        <div className={styles.userMessage}>
                          {group.userMessage.content}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 해당 그룹의 AI 답변들 */}
                  {group.aiMessages.length > 0 && (
                    <div className={styles.aiResponsesContainer}>
                      {group.aiMessages.map((message: Message, index: number) => {
                        // 마지막 그룹이고 AI 메시지이며 스트리밍 중인 메시지인지 확인
                        const isStreamingMessage = isLastGroup && 
                          message.role === 'assistant' && 
                          selectedModels.some(model => 
                            model.id === message.aiModel && (isStreaming[model.name] || typingStateRef.current[model.name]?.isTyping)
                          );
                        
                        const modelInfo = selectedModels.find(model => model.id === message.aiModel);
                        
                        return (
                          <div key={`${message.messageId}-${index}`} className={styles.aiResponse}>
                            <div className={styles.responseContent}>
                              {/* 모델 정보 헤더 */}
                              <div className={styles.modelHeader}>
                                <img 
                                  src={message.aiModel?.toLowerCase().includes('claude') ? claudeLogo :
                                       message.aiModel?.toLowerCase().includes('gemini') ? geminiLogo :
                                       openAILogo} 
                                  alt={message.aiModel} 
                                  className={styles.modelIcon}
                                />
                                <span className={styles.modelName}>
                                  {message.aiModel ? 
                                    (message.aiModel.toLowerCase().includes('claude') ? 
                                      message.aiModel.replace(/claude-/g, 'Claude ').replace(/\b\w/g, (l: string) => l.toUpperCase()) :
                                     message.aiModel.toLowerCase().includes('gemini') ? 
                                      message.aiModel.replace(/gemini-/g, 'Gemini ').replace(/\b\w/g, (l: string) => l.toUpperCase()) :
                                     message.aiModel.toUpperCase()) : 
                                    'AI Assistant'}
                                </span>
                              </div>

                              {/* 답변 내용 */}
                              <div className={styles.responseText}>
                                <span dangerouslySetInnerHTML={{ 
                                  __html: formatText(
                                    isStreamingMessage && modelInfo 
                                      ? displayedMessagesRef.current[modelInfo.name] || ''
                                      : message.content
                                  ) 
                                }} />
                                {isStreamingMessage && <span className={styles.cursor}>|</span>}
                              </div>

                              {/* 피드백 버튼 */}
                              <div className={styles.feedbackSection}>
                                <button 
                                  className={`${styles.likeButton} ${feedbackSubmittedMessages.has(message.messageId) ? styles.active : ''}`}
                                  onClick={() => handleLike(message.aiModel || 'AI Assistant', message.messageId)}
                                >
                                  <i className="bi bi-hand-thumbs-up"></i>
                                  {feedbackSubmittedMessages.has(message.messageId) ? '피드백 완료' : '마음에 들어요'}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* 채팅 입력창 */}
        <div 
          ref={chatInputRef}
          className={`${styles.chatInput} ${(isModelSelectionOpen || isModelDetailOpen) ? styles.modalOpen : ''} ${isChatInputFocused ? styles.focused : styles.unfocused}`}
        >
          {!isChatInputFocused && !message ? (
            <div 
              className={styles.simplePlaceholder}
              onClick={() => setIsChatInputFocused(true)}
            >
              질문을 입력해주세요
            </div>
          ) : (
            <textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                
                // 자동 높이 조절
                e.target.style.height = '24px'; // 최소 높이로 리셋
                const newHeight = Math.min(Math.max(e.target.scrollHeight, 24), 320); // 최소 24px, 최대 320px
                e.target.style.height = `${newHeight}px`;
                
                // 텍스트 변경 시 높이 재계산 (textarea 자동 높이 조절 후)
                setTimeout(updateChatInputHeight, 0);
              }}
              placeholder="질문을 입력해주세요."
              className={styles.messageInput}
              onKeyDown={handleKeyPress}
              onFocus={() => setIsChatInputFocused(true)}
              onBlur={() => {
                // 버튼과 상호작용 중이거나 모달이 열린 상태거나 메시지가 있으면 포커스 상태 유지
                if (!message.trim() && !isModelSelectionOpen && !isModelDetailOpen && !isHistoryOpen && !isInteractingWithButtons) {
                  setTimeout(() => {
                    // 100ms 후에도 버튼과 상호작용하지 않는 상태라면 포커스 해제
                    if (!isInteractingWithButtons && !isModelSelectionOpen && !isModelDetailOpen && !isHistoryOpen && !message.trim()) {
                      setIsChatInputFocused(false);
                    }
                  }, 100);
                }
              }}
              rows={1}
              autoFocus={isChatInputFocused}
            />
          )}
          
          {isChatInputFocused && (
            <div 
              className={styles.buttonGroup}
              onMouseEnter={() => setIsInteractingWithButtons(true)}
              onMouseLeave={() => setTimeout(() => setIsInteractingWithButtons(false), 100)}
            >
              <div className={styles.leftButtonGroup}>
                <button 
                  className={`${styles.modelSelectButton} ${(isModelSelectionOpen || isModelDetailOpen) ? styles.active : ''}`}
                  onClick={() => setIsModelSelectionOpen(!isModelSelectionOpen)}
                >
                  모델 선택
                </button>
                
                <button
                  className={`${styles.modelSelectButton} ${isHistoryOpen ? styles.active : ''}`}
                  onClick={handleHistoryToggle}
                >
                  이전 대화
                </button>
                
                <button 
                  className={`${styles.imageButton} ${isImageMode ? styles.active : ''}`}
                  onClick={() => {
                    // 이미지 모드를 활성화할 때 기존 모델 선택 초기화
                    if (!isImageMode) {
                      setSelectedModels([]);
                    }
                    setIsImageMode(!isImageMode);
                  }}
                >
                  <i className="bi bi-image"></i>
                </button>
              </div>
              
              <button
                className={styles.sendButton}
                onClick={handleSubmit}
                disabled={!message.trim()}
              >
                <i className="bi bi-send"></i>
              </button>
            </div>
          )}

          {/* 선택된 모델들 표시 */}
          {selectedModels.length > 0 && isChatInputFocused && (
            <div 
              className={styles.selectedModels}
              onMouseEnter={() => setIsInteractingWithButtons(true)}
              onMouseLeave={() => setTimeout(() => setIsInteractingWithButtons(false), 100)}
            >
              {selectedModels.map((model) => (
                <div key={model.id} className={styles.selectedModelItem}>
                  <div className={styles.modelInfo}>
                    <img src={model.icon} alt={model.name} className={styles.selectedModelIcon} />
                    <span className={styles.selectedModelName}>{model.name}</span>
                  </div>
                  <button 
                    className={styles.removeModelButton}
                    onClick={() => handleRemoveModel(model.id)}
                  >
                    <i className="bi bi-x-lg"></i>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 모델 선택 모달 */}
        {isModelSelectionOpen && (
          <div 
            className={styles.modelSelection}
            onClick={(e) => {
              // 모달 배경 클릭 시 닫기
              if (e.target === e.currentTarget) {
                setIsModelSelectionOpen(false);
                if (!message.trim()) {
                  setIsChatInputFocused(false);
                }
              }
            }}
          >
            <div 
              className={styles.modelSelectionBox}
              onMouseEnter={() => setIsInteractingWithButtons(true)}
              onMouseLeave={() => setTimeout(() => setIsInteractingWithButtons(false), 100)}
            >
              <div className={styles.modelSelectionHeader}>
                <span>모델 선택</span>
              </div>
              
              <div className={styles.modelList}>
              {models.map((model) => {
                // 이미지 모드일 때 해당 브랜드에 이미지 생성 가능한 모델이 있는지 확인
                const hasImageModels = isImageMode ? (modelDetails[model.id]?.length > 0) : true;
                
                return (
                  <button
                    key={model.id}
                    className={`${styles.modelOption} ${!hasImageModels ? styles.disabled : ''}`}
                    onClick={() => hasImageModels && handleModelSelect(model.id)}
                    disabled={!hasImageModels}
                  >
                    <img src={model.icon} alt={model.name} className={styles.modelIcon} />
                    <span>{model.name}</span>
                    {!hasImageModels && isImageMode && (
                      <span className={styles.noImageSupport}>(이미지 생성 미지원)</span>
                    )}
                  </button>
                );
              })}
              </div>
            </div>
          </div>
        )}

        {/* 모델 세부 선택 모달 */}
        {isModelDetailOpen && selectedModelBrand && (
          <div 
            className={styles.modelSelection}
            onClick={(e) => {
              // 모달 배경 클릭 시 닫기
              if (e.target === e.currentTarget) {
                setIsModelDetailOpen(false);
                if (!message.trim()) {
                  setIsChatInputFocused(false);
                }
              }
            }}
          >
            <div 
              className={styles.modelDetailBox}
              onMouseEnter={() => setIsInteractingWithButtons(true)}
              onMouseLeave={() => setTimeout(() => setIsInteractingWithButtons(false), 100)}
            >
              <div className={styles.modelDetailHeader}>
              <button className={styles.backButton} onClick={handleBackToModelSelection}>
                <i className="bi bi-arrow-left"></i>
              </button>
              <span>모델 선택</span>
            </div>
            
            <div className={styles.modelDetailList}>
              {modelInfoLoading ? (
                <div className={styles.loadingMessage}>모델 목록을 불러오는 중...</div>
              ) : (
                modelDetails[selectedModelBrand]?.slice(0, 10).map((model) => (
                  <button
                    key={model.id}
                    className={styles.modelDetailOption}
                    onClick={() => handleModelDetailSelect(model.id)}
                  >
                    <img src={model.icon} alt={model.name} className={styles.modelIcon} />
                    <span>{model.name}</span>
                  </button>
                ))
              )}
              </div>
            </div>
          </div>
        )}

        {/* 이전 대화 모달 */}
        {isHistoryOpen && (
          <div 
            className={styles.modelSelection}
            onClick={(e) => {
              // 모달 배경 클릭 시 닫기
              if (e.target === e.currentTarget) {
                setIsHistoryOpen(false);
                if (!message.trim()) {
                  setIsChatInputFocused(false);
                }
              }
            }}
          >
            <div 
              className={styles.modelSelectionBox}
              onMouseEnter={() => setIsInteractingWithButtons(true)}
              onMouseLeave={() => setTimeout(() => setIsInteractingWithButtons(false), 100)}
            >
              <div className={styles.modelSelectionHeader}>
                <span>이전 대화</span>
              </div>
              
              <div className={styles.conversationList}>
                {historyLoading ? (
                  <div className={styles.loadingMessage}>대화 목록을 불러오는 중...</div>
                ) : conversations.length === 0 ? (
                  <div className={styles.loadingMessage}>대화 내역이 없습니다.</div>
                ) : (
                  conversations.map((conversation) => (
                    <div key={conversation.conversationId} className={styles.conversationItem}>
                      <button
                        className={styles.conversationButton}
                        onClick={() => {
                          setIsHistoryOpen(false);
                          // 메시지가 없으면 포커스 해제
                          if (!message.trim()) {
                            setIsChatInputFocused(false);
                          }
                          navigate(`/ai-chat/detail?conversationId=${conversation.conversationId}`);
                        }}
                      >
                        <span>{conversation.lastMessagePreview}</span>
                      </button>
                      <button
                        className={styles.deleteConversationButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteConversation(conversation.conversationId);
                        }}
                      >
                        <i className="bi bi-x-lg"></i>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* 피드백 모달 */}
        <FeedbackModal
          isOpen={feedbackModal.isOpen}
          onClose={closeFeedbackModal}
          selectedModel={feedbackModal.selectedModel}
          unselectedModel={feedbackModal.unselectedModel}
          onSubmitSuccess={handleFeedbackSuccess}
        />
      </div>
    </div>
  );
};

export default AIChatDetail;