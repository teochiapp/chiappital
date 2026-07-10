import React from 'react';
import styled from 'styled-components';
import { colors } from '../../styles/colors';

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.gap || '0.75rem'};
`;

const LogoImage = styled.img`
  width: ${props => props.size || '48px'};
  height: ${props => props.size || '48px'};
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
  transition: transform 0.2s ease;

  &:hover {
    transform: scale(1.05);
  }
`;

const LogoText = styled.span`
  font-family: 'Unbounded', sans-serif;
  font-weight: ${props => props.weight || '700'};
  font-size: ${props => props.fontSize || '2.5rem'};
  letter-spacing: -0.02em;
`;

const FirstPart = styled.span`
  color: #ffffff; 
`;

const SecondPart = styled.span`
  color: ${colors.secondary}; /* Dorado */
`;

const Logo = ({
  size = '68px',
  fontSize = '3rem',
  weight = '700',
  gap = '0.75rem',
  showText = true,
  className,
  onClick,
  style,
  ...props
}) => {
  const handleClick = onClick ? (e) => {
    e.preventDefault();
    onClick();
  } : undefined;

  return (
    <LogoContainer
      gap={gap}
      className={className}
      onClick={handleClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        transition: onClick ? 'transform 0.2s ease' : 'none',
        ...style
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'scale(1.05)';
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'scale(1)';
        }
      }}
      {...props}
    >
      <LogoImage src="/logo-simple-trade.png" alt="Logo" size={size} />
      {showText && (
        <LogoText
          fontSize={fontSize}
          weight={weight}
        >
          <FirstPart>Chiapp</FirstPart>
          <SecondPart>ital</SecondPart>
        </LogoText>
      )}
    </LogoContainer>
  );
};

export default Logo;
