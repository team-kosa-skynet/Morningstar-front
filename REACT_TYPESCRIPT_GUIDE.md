# Morningstar 프로젝트 React/TypeScript 가이드

## 목차
1. [프로젝트 개요](#프로젝트-개요)
2. [기술 스택](#기술-스택)
3. [프로젝트 구조](#프로젝트-구조)
4. [React 기초 문법](#react-기초-문법)
5. [TypeScript 기초 문법](#typescript-기초-문법)
6. [프로젝트 주요 패턴](#프로젝트-주요-패턴)
7. [상태 관리 (Zustand)](#상태-관리-zustand)
8. [라우팅 (React Router)](#라우팅-react-router)
9. [API 통신](#api-통신)
10. [스타일링](#스타일링)
11. [주요 기능 설명](#주요-기능-설명)

## 프로젝트 개요

Morningstar는 개발자 커뮤니티 플랫폼으로, 사용자들이 게시글을 작성하고 댓글을 달며 소통할 수 있는 웹 애플리케이션입니다.

### 주요 기능
- 회원가입/로그인 (일반, 소셜 로그인)
- 게시글 CRUD
- 댓글 기능
- 포인트 시스템
- 레벨 시스템
- 출석 체크
- 마이페이지

## 기술 스택

- **React 19.1.0**: UI 라이브러리
- **TypeScript 5.8.3**: 타입 안정성을 위한 JavaScript 확장
- **Vite 7.0.4**: 빌드 도구
- **Zustand 5.0.6**: 상태 관리
- **React Router DOM 7.7.0**: 라우팅
- **Axios 1.11.0**: HTTP 통신
- **Sass 1.89.2**: CSS 전처리기
- **Framer Motion 12.23.6**: 애니메이션

## 프로젝트 구조

```
src/
├── assets/          # 정적 자원 (이미지, 아이콘, 폰트)
├── components/      # 재사용 가능한 컴포넌트
├── pages/          # 페이지 컴포넌트
├── services/       # API 통신 함수
├── stores/         # Zustand 스토어
├── styles/         # 전역 스타일
└── utils/          # 유틸리티 함수
```

## React 기초 문법

### 1. 함수형 컴포넌트

React에서는 함수로 컴포넌트를 만듭니다:

```typescript
// 기본 함수형 컴포넌트
import React from 'react';

const MyComponent: React.FC = () => {
  return (
    <div>
      <h1>안녕하세요!</h1>
    </div>
  );
};

export default MyComponent;
```

### 2. Props (속성)

부모 컴포넌트에서 자식 컴포넌트로 데이터를 전달:

```typescript
// Props 타입 정의
interface ButtonProps {
  text: string;
  onClick: () => void;
  disabled?: boolean;  // ? = 선택적 속성
}

// Props를 받는 컴포넌트
const Button: React.FC<ButtonProps> = ({ text, onClick, disabled = false }) => {
  return (
    <button onClick={onClick} disabled={disabled}>
      {text}
    </button>
  );
};

// 사용 예시
<Button text="클릭하세요" onClick={() => alert('클릭!')} />
```

### 3. State (상태)

컴포넌트 내부에서 변경되는 데이터 관리:

```typescript
import { useState } from 'react';

const Counter: React.FC = () => {
  // [현재값, 값변경함수] = useState(초기값)
  const [count, setCount] = useState(0);
  
  const increment = () => {
    setCount(count + 1);  // 값 변경
  };
  
  return (
    <div>
      <p>카운트: {count}</p>
      <button onClick={increment}>증가</button>
    </div>
  );
};
```

### 4. useEffect (부수 효과)

컴포넌트가 렌더링될 때 실행되는 코드:

```typescript
import { useEffect, useState } from 'react';

const DataFetcher: React.FC = () => {
  const [data, setData] = useState(null);
  
  useEffect(() => {
    // 컴포넌트가 마운트될 때 실행
    fetchData();
    
    // 클린업 함수 (컴포넌트가 언마운트될 때 실행)
    return () => {
      console.log('컴포넌트 제거됨');
    };
  }, []); // [] = 한 번만 실행
  
  useEffect(() => {
    // data가 변경될 때마다 실행
    console.log('데이터 변경됨:', data);
  }, [data]); // [data] = data가 변경될 때 실행
  
  const fetchData = async () => {
    const response = await fetch('/api/data');
    const result = await response.json();
    setData(result);
  };
  
  return <div>{data ? JSON.stringify(data) : '로딩중...'}</div>;
};
```

### 5. 조건부 렌더링

```typescript
const ConditionalComponent: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  return (
    <div>
      {/* 삼항 연산자 */}
      {isLoggedIn ? <p>환영합니다!</p> : <p>로그인해주세요</p>}
      
      {/* && 연산자 */}
      {isLoggedIn && <button>로그아웃</button>}
      
      {/* 함수로 분리 */}
      {renderContent()}
    </div>
  );
  
  function renderContent() {
    if (isLoggedIn) {
      return <Dashboard />;
    }
    return <LoginForm />;
  }
};
```

### 6. 리스트 렌더링

```typescript
const TodoList: React.FC = () => {
  const [todos, setTodos] = useState([
    { id: 1, text: 'React 공부하기' },
    { id: 2, text: 'TypeScript 익히기' }
  ]);
  
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>{todo.text}</li>  // key는 필수!
      ))}
    </ul>
  );
};
```

## TypeScript 기초 문법

### 1. 타입 정의

```typescript
// 기본 타입
let name: string = '홍길동';
let age: number = 25;
let isStudent: boolean = true;
let items: string[] = ['apple', 'banana'];  // 배열
let tuple: [string, number] = ['hello', 10];  // 튜플

// 객체 타입
interface User {
  id: number;
  name: string;
  email: string;
  age?: number;  // 선택적 속성
}

const user: User = {
  id: 1,
  name: '홍길동',
  email: 'hong@example.com'
  // age는 선택적이므로 없어도 됨
};
```

### 2. 함수 타입

```typescript
// 함수 선언
function add(a: number, b: number): number {
  return a + b;
}

// 화살표 함수
const multiply = (a: number, b: number): number => a * b;

// 함수 타입 정의
type CalculateFunc = (a: number, b: number) => number;
const divide: CalculateFunc = (a, b) => a / b;

// 옵셔널 파라미터
function greet(name: string, title?: string): string {
  if (title) {
    return `${title} ${name}님 안녕하세요`;
  }
  return `${name}님 안녕하세요`;
}
```

### 3. Union 타입 (|)

여러 타입 중 하나:

```typescript
// 문자열 또는 숫자
let id: string | number = 'ABC123';
id = 123;  // OK

// 리터럴 타입
type Status = 'pending' | 'completed' | 'failed';
let orderStatus: Status = 'pending';

// 함수에서 사용
function processValue(value: string | number) {
  if (typeof value === 'string') {
    return value.toUpperCase();
  }
  return value * 2;
}
```

### 4. Type과 Interface

```typescript
// Type 별칭
type Point = {
  x: number;
  y: number;
};

// Interface
interface Rectangle {
  width: number;
  height: number;
}

// Interface 확장
interface ColoredRectangle extends Rectangle {
  color: string;
}

// Type 조합
type Shape = Point & Rectangle;  // 두 타입을 합침
```

### 5. 제네릭 (Generic)

타입을 변수처럼 사용:

```typescript
// 제네릭 함수
function identity<T>(value: T): T {
  return value;
}

const num = identity<number>(42);
const str = identity<string>('hello');

// 제네릭 인터페이스
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// 사용 예시
const userResponse: ApiResponse<User> = {
  data: { id: 1, name: '홍길동', email: 'hong@example.com' },
  status: 200,
  message: 'Success'
};
```

## 프로젝트 주요 패턴

### 1. 컴포넌트 구조 패턴

프로젝트에서 사용하는 컴포넌트 패턴:

```typescript
// src/pages/Community/CommunityList/CommunityList.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CommunityList.module.scss';
import { getBoards } from '../../../services/authApi';
import { useAuthStore } from '../../../stores/authStore';

// 타입 정의
interface PostItem {
  boardId: number;
  title: string;
  writer: string;
  // ... 기타 속성
}

const CommunityList = () => {
  const navigate = useNavigate();
  const { token } = useAuthStore();  // Zustand 스토어 사용
  
  // 상태 관리
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(false);
  
  // API 호출
  useEffect(() => {
    fetchPosts();
  }, []);
  
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await getBoards(0, 10, 'createdAt,desc', token);
      setPosts(response.data.content);
    } catch (error) {
      console.error('게시글 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 이벤트 핸들러
  const handlePostClick = (boardId: number) => {
    navigate(`/community/detail/${boardId}`);
  };
  
  // 렌더링
  return (
    <div className={styles.communityList}>
      {loading ? (
        <div>로딩중...</div>
      ) : (
        posts.map(post => (
          <div key={post.boardId} onClick={() => handlePostClick(post.boardId)}>
            {post.title}
          </div>
        ))
      )}
    </div>
  );
};

export default CommunityList;
```

### 2. API 서비스 패턴

```typescript
// src/services/authApi.ts
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://www.gaebang.site/api';

// 요청/응답 타입 정의
interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  code: number;
  message: string;
  data: {
    email: string;
    name: string;
    token: string;
    userId: number;
    role: string;
    point: number;
    level: number;
  };
}

// API 함수
export const login = async (loginData: LoginRequest): Promise<LoginResponse> => {
  try {
    const response = await axios.post<LoginResponse>(
      `${API_BASE_URL}/login`,
      loginData
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw error;
  }
};

// 인증이 필요한 API
export const getBoards = async (
  page: number = 0,
  size: number = 10,
  sort: string = 'createdAt,asc',
  token?: string
): Promise<BoardsResponse> => {
  const headers: any = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  const response = await axios.get<BoardsResponse>(
    `${API_BASE_URL}/boards?page=${page}&size=${size}&sort=${sort}`,
    { headers }
  );
  return response.data;
};
```

## 상태 관리 (Zustand)

Zustand는 간단하고 가벼운 상태 관리 라이브러리입니다:

```typescript
// src/stores/authStore.ts
import { create } from 'zustand';

// 타입 정의
interface User {
  email: string;
  name: string;
  userId: number;
  role: string;
  point: number;
  level: number;
}

interface AuthState {
  // 상태
  isLoggedIn: boolean;
  user: User | null;
  token: string | null;
  
  // 액션
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUserPoint: (point: number) => void;
}

// 스토어 생성
export const useAuthStore = create<AuthState>((set, get) => ({
  // 초기 상태
  isLoggedIn: false,
  user: null,
  token: null,
  
  // 액션 구현
  login: (user: User, token: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({
      isLoggedIn: true,
      user,
      token,
    });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({
      isLoggedIn: false,
      user: null,
      token: null,
    });
  },
  
  updateUserPoint: (point: number) => {
    const { user } = get();  // 현재 상태 가져오기
    if (user) {
      const updatedUser = { ...user, point };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      set({ user: updatedUser });
    }
  },
}));

// 컴포넌트에서 사용
const MyComponent = () => {
  const { user, isLoggedIn, login, logout } = useAuthStore();
  
  return (
    <div>
      {isLoggedIn ? (
        <div>
          <p>{user?.name}님 환영합니다!</p>
          <button onClick={logout}>로그아웃</button>
        </div>
      ) : (
        <button onClick={() => login(userData, token)}>로그인</button>
      )}
    </div>
  );
};
```

## 라우팅 (React Router)

### 1. 라우터 설정

```typescript
// src/App.tsx
import { HashRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/community" element={<CommunityList />} />
        <Route path="/community/detail/:boardId" element={<CommunityDetail />} />
        <Route path="/mypage" element={<MyPage />} />
      </Routes>
    </HashRouter>
  );
}
```

### 2. 네비게이션

```typescript
import { useNavigate, useParams, useLocation } from 'react-router-dom';

const MyComponent = () => {
  const navigate = useNavigate();
  const { boardId } = useParams();  // URL 파라미터
  const location = useLocation();    // 현재 위치
  
  // 프로그래매틱 네비게이션
  const goToHome = () => {
    navigate('/');
  };
  
  const goBack = () => {
    navigate(-1);  // 뒤로가기
  };
  
  const goToPost = (id: number) => {
    navigate(`/community/detail/${id}`);
  };
  
  return (
    <div>
      <p>현재 게시글 ID: {boardId}</p>
      <p>현재 경로: {location.pathname}</p>
      <button onClick={goToHome}>홈으로</button>
    </div>
  );
};
```

## API 통신

### 1. 기본 패턴

```typescript
const fetchData = async () => {
  setLoading(true);
  setError(null);
  
  try {
    const response = await apiFunction(params);
    setData(response.data);
  } catch (error: any) {
    console.error('API 에러:', error);
    setError(error.message || '오류가 발생했습니다.');
  } finally {
    setLoading(false);
  }
};
```

### 2. 인증이 필요한 요청

```typescript
const { token } = useAuthStore();

const createPost = async (postData: PostData) => {
  if (!token) {
    alert('로그인이 필요합니다.');
    return;
  }
  
  try {
    const response = await createBoard(postData, token);
    alert('게시글이 작성되었습니다.');
    navigate('/community');
  } catch (error: any) {
    if (error.code === 401) {
      alert('인증이 만료되었습니다. 다시 로그인해주세요.');
      logout();
    } else {
      alert('게시글 작성에 실패했습니다.');
    }
  }
};
```

## 스타일링

### 1. CSS Modules + SCSS

```scss
// CommunityList.module.scss
.communityList {
  padding: 20px;
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .postItem {
    padding: 16px;
    border: 1px solid #e0e0e0;
    margin-bottom: 12px;
    cursor: pointer;
    
    &:hover {
      background-color: #f5f5f5;
    }
    
    .title {
      font-size: 18px;
      font-weight: bold;
      color: #333;
    }
    
    .meta {
      display: flex;
      gap: 16px;
      margin-top: 8px;
      font-size: 14px;
      color: #666;
    }
  }
}
```

```typescript
// 컴포넌트에서 사용
import styles from './CommunityList.module.scss';

<div className={styles.communityList}>
  <div className={styles.container}>
    <div className={styles.postItem}>
      <h3 className={styles.title}>제목</h3>
      <div className={styles.meta}>메타 정보</div>
    </div>
  </div>
</div>
```

### 2. 전역 스타일

```scss
// src/styles/global.scss
@import 'variables';

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Pretendard', sans-serif;
  background-color: $bg-color;
  color: $text-color;
}

// src/styles/_variables.scss
$primary-color: #5C6EF8;
$bg-color: #151621;
$text-color: #FFFFFF;
```

## 주요 기능 설명

### 1. 로그인 플로우

1. 사용자가 이메일/비밀번호 입력
2. `login` API 호출
3. 성공 시 토큰과 사용자 정보를 Zustand 스토어에 저장
4. localStorage에도 저장 (새로고침 대비)
5. 출석 체크 API 자동 호출
6. 홈 페이지로 리다이렉트

```typescript
const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  
  try {
    // 1. 로그인 API 호출
    const response = await login({
      email: formData.email,
      password: formData.password
    });
    
    // 2. 스토어에 저장
    loginStore(response.data, response.data.token);
    
    // 3. 출석 체크
    await markAttendance(response.data.token);
    
    // 4. 홈으로 이동
    navigate('/');
  } catch (error) {
    alert('로그인 실패');
  }
};
```

### 2. 게시글 작성 플로우

1. 제목, 내용 입력
2. 이미지 선택 시 미리보기 표시
3. 작성 버튼 클릭
4. 이미지를 S3에 업로드
5. 업로드된 이미지 URL과 함께 게시글 생성 API 호출
6. 포인트 정보 새로고침
7. 게시글 목록으로 이동

### 3. 포인트 시스템

- 출석: 매일 첫 로그인 시 10포인트
- 게시글 작성: 5포인트
- 댓글 작성: 2포인트
- 레벨업: 포인트 누적에 따라 자동 레벨업

### 4. 파일 업로드

```typescript
const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = e.target.files;
  if (files && files.length > 0) {
    const newFiles = Array.from(files);
    
    // FileReader로 미리보기 생성
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPreviewUrls(prev => [...prev, event.target.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
    
    setSelectedFiles(prev => [...prev, ...newFiles]);
  }
};

// S3 업로드
const uploadedUrls = await Promise.all(
  selectedFiles.map(file => uploadImage(file, token))
);
```

### 5. 무한 스크롤/페이지네이션

프로젝트에서는 페이지네이션을 사용:

```typescript
const [currentPage, setCurrentPage] = useState(0);
const [totalPages, setTotalPages] = useState(0);

const fetchPosts = async (page: number) => {
  const response = await getBoards(page, 10, 'createdAt,desc');
  setPosts(response.data.content);
  setTotalPages(response.data.totalPages);
};

// 페이지 변경 시
const handlePageChange = (page: number) => {
  setCurrentPage(page - 1);  // API는 0부터, UI는 1부터
  fetchPosts(page - 1);
};
```

## 개발 환경 설정

### 1. 프로젝트 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 린트 검사
npm run lint
```

### 2. 환경 변수

`.env` 파일 생성:

```
VITE_API_BASE_URL=https://www.gaebang.site/api
```

### 3. VS Code 추천 확장

- ESLint
- Prettier
- TypeScript Vue Plugin
- SCSS IntelliSense

## 자주 사용하는 패턴 정리

### 1. 로딩 상태 관리

```typescript
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

// API 호출 시
setLoading(true);
setError(null);
try {
  // API 호출
} catch (error) {
  setError('에러 메시지');
} finally {
  setLoading(false);
}
```

### 2. 폼 데이터 관리

```typescript
const [formData, setFormData] = useState({
  email: '',
  password: ''
});

const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setFormData(prev => ({
    ...prev,
    [name]: value
  }));
};
```

### 3. 디바운싱 (검색 등)

```typescript
import { useEffect, useState } from 'react';

const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [value, delay]);
  
  return debouncedValue;
};

// 사용
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearchTerm = useDebounce(searchTerm, 500);

useEffect(() => {
  if (debouncedSearchTerm) {
    // 검색 API 호출
  }
}, [debouncedSearchTerm]);
```

## 마무리

이 문서는 Morningstar 프로젝트의 React/TypeScript 사용 패턴을 정리한 것입니다. 프로젝트를 이해하고 개발하는 데 도움이 되길 바랍니다.

추가로 궁금한 점이 있다면:
- React 공식 문서: https://react.dev/
- TypeScript 공식 문서: https://www.typescriptlang.org/
- Zustand 문서: https://github.com/pmndrs/zustand
- React Router 문서: https://reactrouter.com/