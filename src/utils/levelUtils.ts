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

// 포인트별 레벨 계산 함수
export const getLevelFromPoints = (points: number): number => {
  if (points <= 1000) return 1;
  if (points <= 3000) return 2;
  if (points <= 6000) return 3;
  if (points <= 10000) return 4;
  if (points <= 15000) return 5;
  if (points <= 30000) return 6;
  if (points <= 60000) return 7;
  if (points <= 120000) return 8;
  if (points <= 200000) return 9;
  return 10; // 200001~
};

// 레벨별 아이콘 가져오기 함수
export const getLevelIcon = (points: number): string => {
  const level = getLevelFromPoints(points);
  return levelIcons[level as keyof typeof levelIcons];
};

// 레벨별 이름 가져오기 함수 (선택사항)
export const getLevelName = (points: number): string => {
  const level = getLevelFromPoints(points);
  return `레벨 ${level}`;
};

// 다음 레벨까지 필요한 포인트 계산 (선택사항)
export const getPointsToNextLevel = (points: number): number | null => {
  if (points <= 1000) return 1000 - points;
  if (points <= 3000) return 3000 - points;
  if (points <= 6000) return 6000 - points;
  if (points <= 10000) return 10000 - points;
  if (points <= 15000) return 15000 - points;
  if (points <= 30000) return 30000 - points;
  if (points <= 60000) return 60000 - points;
  if (points <= 120000) return 120000 - points;
  if (points <= 200000) return 200000 - points;
  return null; // 최고 레벨
};