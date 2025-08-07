import React, { useState } from 'react';
import styles from './Navigation.module.scss';
import {useNavigate} from "react-router-dom";

const Navigation: React.FC = () => {
  const [activeItem, setActiveItem] = useState('프롬프트 가이드');

  const navItems = [
    '프롬프트 가이드',
    'AI 분석',
    'AI 추천',
    'divider',
    'AI 뉴스',
    '채용공고',
    'divider',
    '질문하기',
    '모의면접',
    'divider',
    '커뮤니티'
  ];

  const navigate = useNavigate();

  const handleItemClick = (item: string) => {
    if (item !== 'divider') {
      setActiveItem(item);
    }
    if (item === '커뮤니티') {
      navigate('/community', { state: { resetSearch: true } });
    }
    if (item === '질문하기') {
      navigate('/ai-chat');
    }
    if (item === 'AI 뉴스') {
      navigate('/ai-news');
    }
  };

  return (
    <nav className={styles.navigation}>
      <div className={styles.navContainer}>
        {navItems.map((item, index) => {
          if (item === 'divider') {
            return (
              <div key={index} className={styles.navDivider}>
                <img src="../../assets/images/dash-icon.svg" alt="divider" />
              </div>
            );
          }

          return (
            <div 
              key={index} 
              className={styles.navItem}
              onClick={() => handleItemClick(item)}
            >
              {activeItem === item ? (
                <div className={styles.activeNavItem}>
                  <span>{item}</span>
                </div>
              ) : (
                <span>{item}</span>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;