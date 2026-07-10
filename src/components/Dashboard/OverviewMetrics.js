import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { DollarSign, Edit3, TrendingUp, RefreshCw, Check, X } from 'lucide-react';
import { colors } from '../../styles/colors';
import { useApiBalances } from '../../hooks/useApiBalances';

const OverviewMetrics = () => {
  const { balance, updateBalance, loading: balanceLoading } = useApiBalances();
  const [dolarMep, setDolarMep] = useState(null);
  const [loadingDolar, setLoadingDolar] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const fetchDolar = async () => {
    try {
      setLoadingDolar(true);
      // Bluelytics is a very stable API for Dolar Blue/Oficial
      const res = await fetch('https://api.bluelytics.com.ar/v2/latest');
      const data = await res.json();
      setDolarMep(data.blue.value_sell); // Usamos Dólar Blue como referencia
    } catch (err) {
      console.error('Error fetching dolar MEP:', err);
    } finally {
      setLoadingDolar(false);
    }
  };

  useEffect(() => {
    fetchDolar();
    // Refresh exchange rate every 5 minutes
    const interval = setInterval(fetchDolar, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleEditClick = () => {
    setEditValue(balance.toString());
    setIsEditing(true);
  };

  const handleSaveClick = async () => {
    const val = parseFloat(editValue);
    if (!isNaN(val)) {
      await updateBalance(val);
    }
    setIsEditing(false);
  };

  const balanceARS = balance && dolarMep ? balance * dolarMep : 0;

  return (
    <OverviewContainer>
      <BalanceSection>
        <Subtitle>Capital Total (USD)</Subtitle>
        <BalanceWrapper>
          <DollarIcon>
            <DollarSign size={32} />
          </DollarIcon>
          
          {isEditing ? (
            <EditControls>
              <InputWrapper>
                <DollarPrefix>$</DollarPrefix>
                <Input 
                  type="number" 
                  value={editValue} 
                  onChange={e => setEditValue(e.target.value)} 
                  autoFocus
                  placeholder="0"
                />
              </InputWrapper>
              <IconButton onClick={handleSaveClick} className="save"><Check size={20} /></IconButton>
              <IconButton onClick={() => setIsEditing(false)} className="cancel"><X size={20} /></IconButton>
            </EditControls>
          ) : (
            <>
              <MainBalance>
                {balanceLoading ? '...' : `$${balance.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`}
              </MainBalance>
              <EditButton onClick={handleEditClick}>
                <Edit3 size={18} />
              </EditButton>
            </>
          )}
        </BalanceWrapper>
      </BalanceSection>

      <MetricsGrid>
        <MetricCard>
          <MetricHeader>
            <span>Dólar Blue (Referencia)</span>
            <button onClick={fetchDolar} title="Actualizar cotización" className="refresh-btn">
              <RefreshCw size={14} className={loadingDolar ? 'spin' : ''} />
            </button>
          </MetricHeader>
          <MetricValue>
            ${loadingDolar ? '...' : dolarMep?.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
          </MetricValue>
          <MetricSub>api.bluelytics.com.ar</MetricSub>
        </MetricCard>

        <MetricCard className="highlight">
          <MetricHeader>
            <span>Equivalente ARS</span>
            <TrendingUp size={16} color={colors.secondary} />
          </MetricHeader>
          <MetricValue className="gold">
            ${balanceLoading || loadingDolar ? '...' : balanceARS.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
          </MetricValue>
          <MetricSub>ARS Totales</MetricSub>
        </MetricCard>
      </MetricsGrid>
    </OverviewContainer>
  );
};

// ─── Estilos (Modo Oscuro) ──────────────────────────────────────────────────

const OverviewContainer = styled.div`
  background: #111827; /* Darker than normal card */
  border-radius: 24px;
  padding: 2.5rem;
  color: white;
  margin-bottom: 3rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  position: relative;
  overflow: hidden;

  @media (max-width: 1024px) {
    flex-direction: column;
    align-items: stretch;
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${colors.gradients.primary};
  }
`;

const BalanceSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
`;

const Subtitle = styled.h3`
  font-size: 1.1rem;
  color: #9ca3af;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0;
`;

const BalanceWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
`;

const DollarIcon = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 14px;
  background: rgba(101, 29, 35, 0.2);
  color: ${colors.secondary}; /* Gold */
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(212, 175, 55, 0.3);
`;

const MainBalance = styled.h1`
  font-size: 3.5rem;
  font-weight: 800;
  margin: 0;
  color: white;
  letter-spacing: -1px;
  font-family: 'Unbounded', sans-serif;
`;

const EditButton = styled.button`
  background: transparent;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
`;

const EditControls = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(0, 0, 0, 0.2);
  padding: 0.5rem;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const DollarPrefix = styled.span`
  position: absolute;
  left: 1rem;
  color: ${colors.secondary};
  font-size: 2rem;
  font-weight: 800;
  font-family: 'Unbounded', sans-serif;
`;

const Input = styled.input`
  font-size: 2.5rem;
  font-weight: 800;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 12px;
  padding: 0.5rem 1rem 0.5rem 3rem;
  width: 250px;
  font-family: 'Unbounded', sans-serif;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${colors.secondary};
    box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.2);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.2);
  }
`;

const IconButton = styled.button`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  color: white;
  transition: all 0.2s ease;

  &.save {
    background: rgba(16, 185, 129, 0.2);
    color: #34d399;
    border: 1px solid rgba(16, 185, 129, 0.3);
    &:hover { 
      background: rgba(16, 185, 129, 0.4); 
      transform: translateY(-2px);
    }
  }

  &.cancel {
    background: rgba(239, 68, 68, 0.2);
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.3);
    &:hover { 
      background: rgba(239, 68, 68, 0.4); 
      transform: translateY(-2px);
    }
  }
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  flex: 1.5;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const MetricCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  &.highlight {
    background: rgba(212, 175, 55, 0.05); /* Tint of gold */
    border-color: rgba(212, 175, 55, 0.2);
  }
`;

const MetricHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #9ca3af;
  font-size: 0.95rem;
  font-weight: 500;

  .refresh-btn {
    background: transparent;
    border: none;
    color: #6b7280;
    cursor: pointer;
    padding: 2px;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover { color: white; }
    
    .spin {
      animation: spin 1s linear infinite;
    }
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const MetricValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: white;
  font-family: 'Unbounded', sans-serif;

  &.gold {
    color: ${colors.secondary}; /* Gold text */
  }
`;

const MetricSub = styled.div`
  font-size: 0.85rem;
  color: #6b7280;
`;

export default OverviewMetrics;
