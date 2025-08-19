import React, { useState } from 'react';
import styles from './Navigation.module.scss';
import {useNavigate} from "react-router-dom";
import anthropicIcon from '../../assets/images/anthropic (1).svg';
import leaderboardIcon from '../../assets/images/nav-img/leaderboard-removebg-preview 1.png';
import itNewsIcon from '../../assets/images/nav-img/news.svg';
import jobIcon from '../../assets/images/nav-img/job.svg';
import questionIcon from '../../assets/images/nav-img/question.svg';
import micIcon from '../../assets/images/nav-img/mic.svg';
import communityIcon from '../../assets/images/nav-img/community.svg';

const Navigation: React.FC = () => {
  const [activeItem, setActiveItem] = useState('프롬프트 가이드');

  const navItems = [
    '업데이트 소식',
    '리더보드',
    'divider',
    'IT 뉴스',
    '채용공고',
    'divider',
    '질문하기',
    '모의면접',
    'divider',
    '커뮤니티'
  ];

  const navigate = useNavigate();

  const getIconForItem = (item: string) => {
    switch (item) {
      case '리더보드':
        return leaderboardIcon;
      case 'IT 뉴스':
        return itNewsIcon;
      case '채용공고':
        return jobIcon;
      case '질문하기':
        return questionIcon;
      case '모의면접':
        return micIcon;
      case '커뮤니티':
        return communityIcon;
      default:
        return anthropicIcon;
    }
  };

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
    if (item === 'IT 뉴스') {
      navigate('/ai-news');
    }
    if (item === '채용공고') {
      navigate('/jobs');
    }
    if (item === '모의면접') {
      navigate('/interview');
    }
    if (item === '리더보드') {
      navigate('/leaderboard');
    }
    if (item === '업데이트 소식') {
      navigate('/ai-update');
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
                  <img src={getIconForItem(item)} alt="icon" className={styles.navIcon} />
                  <span>{item}</span>
                </div>
              ) : (
                <div className={styles.navItemContent}>
                  <img src={getIconForItem(item)} alt="icon" className={styles.navIcon} />
                  <span>{item}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;