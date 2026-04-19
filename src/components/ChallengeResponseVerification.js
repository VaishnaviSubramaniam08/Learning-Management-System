import React, { useState, useEffect } from 'react';
import faceDetectionService from '../services/faceDetectionService';

const ChallengeResponseVerification = ({ 
  videoRef, 
  onChallengeComplete, 
  onChallengeFailed,
  isActive = false 
}) => {
  const [currentChallenge, setCurrentChallenge] = useState(null);
  const [challengeStatus, setChallengeStatus] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const maxAttempts = 3;
  const challengeTimeout = 15000; // 15 seconds

  useEffect(() => {
    if (isActive && !currentChallenge) {
      startNewChallenge();
    }
  }, [isActive]);

  useEffect(() => {
    let timer;
    if (currentChallenge && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleChallengeTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [currentChallenge, timeRemaining]);

  const startNewChallenge = () => {
    const challenge = faceDetectionService.generateChallenge();
    setCurrentChallenge(challenge);
    setTimeRemaining(challengeTimeout / 1000);
    setChallengeStatus(getChallengeInstruction(challenge.type));
    setAttempts(0);
    setIsCompleted(false);
  };

  const getChallengeInstruction = (challengeType) => {
    const instructions = {
      blink: 'Please blink your eyes naturally',
      smile: 'Please smile for the camera',
      turn_left: 'Please turn your head to the left',
      turn_right: 'Please turn your head to the right',
      nod: 'Please nod your head up and down'
    };
    return instructions[challengeType] || 'Follow the instruction';
  };

  const getChallengeIcon = (challengeType) => {
    const icons = {
      blink: '👁️',
      smile: '😊',
      turn_left: '⬅️',
      turn_right: '➡️',
      nod: '↕️'
    };
    return icons[challengeType] || '🎯';
  };

  const verifyChallengeResponse = async (detection) => {
    if (!currentChallenge || isCompleted || !videoRef.current) return;

    try {
      const result = faceDetectionService.verifyChallengeResponse(detection, videoRef.current);
      
      if (result.success) {
        setIsCompleted(true);
        setChallengeStatus('✅ Challenge completed successfully!');
        setTimeout(() => {
          if (onChallengeComplete) {
            onChallengeComplete({
              challenge: currentChallenge,
              attempts: attempts + 1,
              timeUsed: (challengeTimeout / 1000) - timeRemaining
            });
          }
        }, 1000);
      } else {
        setAttempts(prev => prev + 1);
        setChallengeStatus(result.message);
        
        if (attempts + 1 >= maxAttempts) {
          handleChallengeFailed();
        }
      }
    } catch (error) {
      console.error('Challenge verification error:', error);
      handleChallengeFailed();
    }
  };

  const handleChallengeTimeout = () => {
    setChallengeStatus('⏰ Challenge timed out');
    handleChallengeFailed();
  };

  const handleChallengeFailed = () => {
    setIsCompleted(true);
    if (onChallengeFailed) {
      onChallengeFailed({
        challenge: currentChallenge,
        attempts: attempts,
        reason: attempts >= maxAttempts ? 'max_attempts' : 'timeout'
      });
    }
  };

  const retryChallenge = () => {
    startNewChallenge();
  };

  // This function should be called from the parent component during face detection
  const processDetection = (detection) => {
    if (isActive && currentChallenge && !isCompleted) {
      verifyChallengeResponse(detection);
    }
  };

  // Expose the processDetection function to parent
  useEffect(() => {
    if (window.challengeResponseVerification) {
      window.challengeResponseVerification.processDetection = processDetection;
    } else {
      window.challengeResponseVerification = { processDetection };
    }
  }, [currentChallenge, isCompleted, attempts]);

  if (!isActive || !currentChallenge) {
    return null;
  }

  return (
    <div style={{
      position: 'absolute',
      top: '10px',
      left: '10px',
      right: '10px',
      background: 'rgba(255, 255, 255, 0.95)',
      padding: '15px',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
      zIndex: 10
    }}>
      {/* Challenge Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px' }}>
            {getChallengeIcon(currentChallenge.type)}
          </span>
          <h4 style={{ margin: 0, color: '#333' }}>Security Challenge</h4>
        </div>
        <div style={{
          background: timeRemaining <= 5 ? '#f44336' : '#2196f3',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold'
        }}>
          {timeRemaining}s
        </div>
      </div>

      {/* Challenge Instruction */}
      <div style={{
        background: isCompleted ? 
          (challengeStatus.includes('✅') ? '#e8f5e8' : '#ffebee') : 
          '#e3f2fd',
        padding: '12px',
        borderRadius: '6px',
        marginBottom: '10px',
        border: `1px solid ${
          isCompleted ? 
            (challengeStatus.includes('✅') ? '#4caf50' : '#f44336') : 
            '#2196f3'
        }`
      }}>
        <p style={{
          margin: 0,
          fontWeight: 'bold',
          color: isCompleted ? 
            (challengeStatus.includes('✅') ? '#2e7d32' : '#c62828') : 
            '#1976d2'
        }}>
          {challengeStatus}
        </p>
      </div>

      {/* Progress Indicator */}
      <div style={{ marginBottom: '10px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12px',
          color: '#666',
          marginBottom: '5px'
        }}>
          <span>Attempt {attempts + 1} of {maxAttempts}</span>
          <span>Challenge: {currentChallenge.type.replace('_', ' ')}</span>
        </div>
        
        <div style={{
          width: '100%',
          height: '4px',
          background: '#e0e0e0',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${((challengeTimeout / 1000 - timeRemaining) / (challengeTimeout / 1000)) * 100}%`,
            height: '100%',
            background: timeRemaining <= 5 ? '#f44336' : '#4caf50',
            transition: 'width 1s linear'
          }}></div>
        </div>
      </div>

      {/* Action Buttons */}
      {isCompleted && !challengeStatus.includes('✅') && (
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            onClick={retryChallenge}
            style={{
              background: '#4caf50',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* Security Indicators */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '15px',
        marginTop: '10px',
        fontSize: '10px',
        color: '#666'
      }}>
        <span>🔒 Anti-Spoofing</span>
        <span>🎯 Challenge-Response</span>
        <span>🛡️ Live Detection</span>
      </div>
    </div>
  );
};

export default ChallengeResponseVerification;
