import React from 'react';
import styled, { keyframes } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useAccount } from '../context/AccountContext';
import { Wallet, Users, ArrowRight, LogOut } from 'lucide-react';
import { useStrapiAuth } from '../hooks/useApiTrades';

const AccountSelectionContainer = () => {
  const { changeAccount } = useAccount();
  const navigate = useNavigate();
  const { logout } = useStrapiAuth();

  const handleSelect = (type) => {
    changeAccount(type);
    navigate('/dashboard');
  };

  const handleLogoutClick = () => {
    logout();
    navigate('/login');
  };

  return (
    <Container>
      <LogoutButton onClick={handleLogoutClick}>
        <LogOut size={18} />
        Salir
      </LogoutButton>
      <Header>
        <Title>Bienvenido a Chiappital</Title>
        <Subtitle>Seleccioná la cartera que querés visualizar</Subtitle>
      </Header>

      <CardsWrapper>
        <AccountCard onClick={() => handleSelect('propia')}>
          <IconWrapper className="propia">
            <Wallet size={40} />
          </IconWrapper>
          <CardTitle>Cuenta Teo</CardTitle>
          <CardDescription>
            Orientado a Swing Trading
          </CardDescription>
          <ActionText className="propia">
            Ingresar <ArrowRight size={18} />
          </ActionText>
        </AccountCard>

        <AccountCard onClick={() => handleSelect('compartida')}>
          <IconWrapper className="compartida">
            <Users size={40} />
          </IconWrapper>
          <CardTitle>Cuenta Tripartita</CardTitle>
          <CardDescription>
            Orientado a inversión de Largo Plazo
          </CardDescription>
          <ActionText className="compartida">
            Ingresar <ArrowRight size={18} />
          </ActionText>
        </AccountCard>
      </CardsWrapper>
    </Container>
  );
};

// ─── Estilos ─────────────────────────────────────────────────────────────────

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  min-height: 100vh;
  background-color: #0f172a;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  justify-content: center;
  padding: 2rem;
  color: white;
  position: relative;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 4rem;
  animation: ${fadeIn} 0.5s ease-out;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 1rem;
  background: linear-gradient(to right, #fff, #94a3b8);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Subtitle = styled.p`
  font-size: 1.2rem;
  color: #94a3b8;
`;

const CardsWrapper = styled.div`
  display: flex;
  gap: 2rem;
  max-width: 900px;
  width: 100%;
  animation: ${fadeIn} 0.7s ease-out forwards;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const IconWrapper = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
  transition: transform 0.3s ease;

  &.propia {
    background: rgba(101, 29, 35, 0.1);
    color: #A9333F;
  }

  &.compartida {
    background: rgba(16, 185, 129, 0.1);
    color: #34d399;
  }
`;

const ActionText = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: auto;
  font-weight: 600;
  font-size: 1.1rem;
  opacity: 0;
  transform: translateX(-10px);
  transition: all 0.3s ease;

  &.propia { color: #A9333F; }
  &.compartida { color: #34d399; }
`;

const AccountCard = styled.div`
  flex: 1;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  padding: 3rem 2rem;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(255,255,255,0.05) 0%, transparent 100%);
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-10px);
    background: rgba(30, 41, 59, 0.8);
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.3);

    &::before {
      opacity: 1;
    }

    ${IconWrapper} {
      transform: scale(1.1);
    }

    ${ActionText} {
      opacity: 1;
      transform: translateX(0);
    }
  }
`;

const CardTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 1rem;
`;

const CardDescription = styled.p`
  color: #94a3b8;
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
`;

const LogoutButton = styled.button`
  position: absolute;
  top: 2rem;
  right: 2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(239, 68, 68, 0.1);
  }
`;

export default AccountSelectionContainer;
