import { TtsPayload } from '../services/apiService';

let currentAudio: HTMLAudioElement | null = null;

const base64ToBlob = (base64Data: string, mimeType: string): Blob => {
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
};

export const playTtsAudio = async (ttsPayload: TtsPayload | null): Promise<void> => {
  if (!ttsPayload || !ttsPayload.base64) {
    console.warn('TTS 데이터가 없습니다.');
    return Promise.resolve();
  }

  // 이전 오디오 정지
  stopCurrentAudio();

  try {
    const { format, base64 } = ttsPayload;
    const mimeType = `audio/${format}`;
    const blob = base64ToBlob(base64, mimeType);
    const audioUrl = URL.createObjectURL(blob);

    const audio = new Audio(audioUrl);
    currentAudio = audio;

    return new Promise((resolve, reject) => {
      audio.onended = () => {
        currentAudio = null;
        URL.revokeObjectURL(audioUrl);
        resolve();
      };

      audio.onerror = (error) => {
        console.error('오디오 재생 오류:', error);
        currentAudio = null;
        URL.revokeObjectURL(audioUrl);
        reject(error);
      };

      audio.play().catch(reject);
    });
  } catch (error) {
    currentAudio = null;
    console.error('오디오 재생 실패:', error);
    throw error;
  }
};

export const stopCurrentAudio = (): void => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
};

export const isAudioPlaying = (): boolean => {
  return currentAudio !== null && !currentAudio.paused;
};