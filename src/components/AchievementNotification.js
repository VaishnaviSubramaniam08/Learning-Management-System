import React, { useState, useEffect } from 'react';

const AchievementNotification = ({ 
  achievement, 
  badge, 
  points, 
  levelUp, 
  onClose, 
  celebrationEffect = 'confetti' 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (achievement || badge || points || levelUp) {
      setIsVisible(true);
      createCelebrationEffect();
      
      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [achievement, badge, points, levelUp]);

  const createCelebrationEffect = () => {
    const particleCount = celebrationEffect === 'fireworks' ? 50 : 30;
    const newParticles = [];

    for (let i = 0; i < particleCount; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        color: getRandomColor(),
        size: Math.random() * 8 + 4,
        delay: Math.random() * 2,
        duration: Math.random() * 3 + 2
      });
    }

    setParticles(newParticles);
  };

  const getRandomColor = () => {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#54a0ff'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };

  const getNotificationContent = () => {
    if (levelUp) {
      return {
        title: '🎉 Level Up!',
        subtitle: `You've reached Level ${levelUp.newLevel}!`,
        description: `New title: ${levelUp.newTitle}`,
        icon: '⭐',
        color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        points: levelUp.bonusPoints
      };
    }

    if (achievement) {
      return {
        title: '🏆 Achievement Unlocked!',
        subtitle: achievement.name,
        description: achievement.description,
        icon: achievement.icon,
        color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        points: achievement.pointsReward
      };
    }

    if (badge) {
      return {
        title: '🏅 Badge Earned!',
        subtitle: badge.name,
        description: badge.description,
        icon: badge.icon,
        color: `linear-gradient(135deg, ${badge.color}22, ${badge.color})`,
        points: badge.pointsReward
      };
    }

    if (points) {
      return {
        title: '💰 Points Earned!',
        subtitle: `+${points} Points`,
        description: 'Keep up the great work!',
        icon: '💎',
        color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        points: points
      };
    }

    return null;
  };

  const content = getNotificationContent();

  if (!content || !isVisible) {
    return null;
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      opacity: isVisible ? 1 : 0,
      transition: 'opacity 0.3s ease'
    }}>
      {/* Celebration Particles */}
      {celebrationEffect === 'confetti' && particles.map(particle => (
        <div
          key={particle.id}
          style={{
            position: 'absolute',
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            background: particle.color,
            borderRadius: celebrationEffect === 'confetti' ? '2px' : '50%',
            animation: `fall ${particle.duration}s ease-in ${particle.delay}s infinite`,
            pointerEvents: 'none'
          }}
        />
      ))}

      {celebrationEffect === 'fireworks' && particles.map(particle => (
        <div
          key={particle.id}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: '4px',
            height: '4px',
            background: particle.color,
            borderRadius: '50%',
            animation: `explode ${particle.duration}s ease-out ${particle.delay}s`,
            pointerEvents: 'none'
          }}
        />
      ))}

      {celebrationEffect === 'sparkles' && particles.map(particle => (
        <div
          key={particle.id}
          style={{
            position: 'absolute',
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: '6px',
            height: '6px',
            background: particle.color,
            borderRadius: '50%',
            animation: `sparkle ${particle.duration}s ease-in-out ${particle.delay}s infinite`,
            pointerEvents: 'none'
          }}
        />
      ))}

      {/* Notification Card */}
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '500px',
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
        transform: isVisible ? 'scale(1) translateY(0)' : 'scale(0.8) translateY(20px)',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Gradient */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '120px',
          background: content.color,
          borderRadius: '20px 20px 0 0'
        }} />

        {/* Close Button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            color: 'white',
            fontSize: '18px',
            cursor: 'pointer',
            zIndex: 1
          }}
        >
          ×
        </button>

        {/* Icon */}
        <div style={{
          fontSize: '80px',
          marginBottom: '20px',
          position: 'relative',
          zIndex: 1,
          filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
        }}>
          {content.icon}
        </div>

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{
            margin: '0 0 12px 0',
            color: '#1f2937',
            fontSize: '28px',
            fontWeight: 'bold'
          }}>
            {content.title}
          </h2>

          <h3 style={{
            margin: '0 0 16px 0',
            color: '#374151',
            fontSize: '22px',
            fontWeight: '600'
          }}>
            {content.subtitle}
          </h3>

          <p style={{
            margin: '0 0 24px 0',
            color: '#6b7280',
            fontSize: '16px',
            lineHeight: '1.5'
          }}>
            {content.description}
          </p>

          {content.points > 0 && (
            <div style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              borderRadius: '25px',
              padding: '12px 24px',
              display: 'inline-block',
              fontSize: '18px',
              fontWeight: 'bold',
              marginBottom: '24px',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}>
              +{content.points} Points Earned! 💰
            </div>
          )}

          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center'
          }}>
            <button
              onClick={handleClose}
              style={{
                background: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 24px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = '#5856eb'}
              onMouseLeave={(e) => e.target.style.background = '#6366f1'}
            >
              Awesome! 🎉
            </button>

            {(achievement || badge) && (
              <button
                onClick={() => {
                  // Share functionality could be implemented here
                  handleClose();
                }}
                style={{
                  background: 'transparent',
                  color: '#6366f1',
                  border: '2px solid #6366f1',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#6366f1';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = '#6366f1';
                }}
              >
                Share 📤
              </button>
            )}
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes explode {
          0% {
            transform: translate(-50%, -50%) scale(0);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px) scale(1);
            opacity: 0;
          }
        }

        @keyframes sparkle {
          0%, 100% {
            transform: scale(0) rotate(0deg);
            opacity: 0;
          }
          50% {
            transform: scale(1) rotate(180deg);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default AchievementNotification;
