// 레벨 아이콘 이미지 import
import lv1 from '../assets/images/level/lv1.png';
import lv2 from '../assets/images/level/lv2.png';
import lv3 from '../assets/images/level/lv3.png';
import lv4 from '../assets/images/level/lv4.png';
import lv5 from '../assets/images/level/lv5.png';
import lv6 from '../assets/images/level/lv6.png';
import lv7 from '../assets/images/level/lv7.png';
import lv8 from '../assets/images/level/lv8.png';
import lv9 from '../assets/images/level/lv9.png';
import lv10 from '../assets/images/level/lv10.png';
import admin from '../assets/images/level/admin.png';
import temp from '../assets/images/level/temp.png';

// 레벨 아이콘 맵핑
const levelIcons = {
  1: lv1,
  2: lv2,
  3: lv3,
  4: lv4,
  5: lv5,
  6: lv6,
  7: lv7,
  8: lv8,
  9: lv9,
  10: lv10,
  admin: admin,
  temp: temp,
};


// 레벨별 아이콘 가져오기 함수 (레벨 직접 사용)
export const getLevelIcon = (level: number): string => {
  const icon = levelIcons[level as keyof typeof levelIcons];
  // undefined 방지를 위한 fallback
  return icon || lv1; // 아이콘이 없으면 레벨 1 아이콘을 기본값으로 사용
};

// 레벨별 이름 가져오기 함수 (선택사항)
export const getLevelName = (level: number): string => {
  return `레벨 ${level}`;
};

