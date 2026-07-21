import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Search, Map, Briefcase, RefreshCw, AlertCircle, TrendingUp, TrendingDown } from 'lucide-react';
import { StyledContainer } from '../common/StyledComponents';
import symbolSearchService from '../../services/symbolSearchService';
import yahooFinanceService from '../../services/yahooFinanceService';
import { colors, withOpacity } from '../../styles/colors';

const ScreenerPage = () => {
  const [activeTab, setActiveTab] = useState('country'); // 'country' or 'sector'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stockData, setStockData] = useState([]);

  useEffect(() => {
    fetchScreenerData();
  }, []);

  const fetchScreenerData = async () => {
    setLoading(true);
    setError(null);
    try {
      const symbolsList = symbolSearchService.getPopularSymbols();
      const tickers = symbolsList.map(s => s.symbol);
      
      // Fetch current quotes from Yahoo Finance (Bulk API)
      const quotesResults = await yahooFinanceService.getBulkQuotes(tickers);
      
      const combinedData = symbolsList.map(item => {
        const quote = quotesResults.find(q => q.symbol === item.symbol);
        return {
          ...item,
          price: quote?.data?.price || 0,
          changePercent: quote?.data?.changePercent || 0,
          change: quote?.data?.change || 0,
          error: quote?.error || null,
        };
      });

      setStockData(combinedData);
    } catch (err) {
      console.error('Error fetching screener data:', err);
      setError('No se pudo cargar la información del mercado. Por favor intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const groupedByCountry = stockData.reduce((acc, stock) => {
    const region = stock.region || 'Otros';
    if (!acc[region]) acc[region] = [];
    acc[region].push(stock);
    return acc;
  }, {});

  const groupedBySector = stockData.reduce((acc, stock) => {
    const sector = stock.sector || 'Otros';
    if (!acc[sector]) acc[sector] = [];
    acc[sector].push(stock);
    return acc;
  }, {});

  return (
    <ScreenerLayout>
      <StyledContainer>
        <HeaderContainer>
          <TitleArea>
            <Title>Screener de Mercado</Title>
            <Subtitle>Analiza el mercado en tiempo real, clasificado por país y por sector.</Subtitle>
          </TitleArea>
          <ActionsArea>
            <RefreshButton onClick={fetchScreenerData} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'spin' : ''} />
              Actualizar
            </RefreshButton>
          </ActionsArea>
        </HeaderContainer>

        <TabsContainer>
          <Tab
            $active={activeTab === 'country'}
            onClick={() => setActiveTab('country')}
          >
            <Map size={18} />
            Por País
          </Tab>
          <Tab
            $active={activeTab === 'sector'}
            onClick={() => setActiveTab('sector')}
          >
            <Briefcase size={18} />
            Por Sector
          </Tab>
        </TabsContainer>

        <ContentArea>
          {loading && stockData.length === 0 ? (
            <LoadingContainer>
              <RefreshCw size={32} className="spin" color={colors.primary} />
              <p>Obteniendo cotizaciones del mercado...</p>
            </LoadingContainer>
          ) : error && stockData.length === 0 ? (
            <ErrorContainer>
              <AlertCircle size={32} color="#f43f5e" />
              <p>{error}</p>
            </ErrorContainer>
          ) : (
            <GroupsContainer>
              {Object.entries(activeTab === 'country' ? groupedByCountry : groupedBySector).map(([groupName, stocks]) => (
                <GroupSection key={groupName}>
                  <GroupTitle>{groupName}</GroupTitle>
                  <Grid>
                    {stocks.map(stock => (
                      <StockCard key={stock.symbol}>
                        <CardHeader>
                          <Symbol>{stock.symbol}</Symbol>
                          <TypeBadge>{stock.type}</TypeBadge>
                        </CardHeader>
                        <CompanyName>{stock.name}</CompanyName>
                        <PriceSection>
                          <Price>${stock.price ? stock.price.toFixed(2) : '--'}</Price>
                          <ChangeBadge $isPositive={stock.changePercent >= 0}>
                            {stock.changePercent >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {stock.changePercent ? Math.abs(stock.changePercent).toFixed(2) : '0.00'}%
                          </ChangeBadge>
                        </PriceSection>
                        <CardFooter>
                          <FooterItem>{activeTab === 'country' ? stock.sector : stock.region}</FooterItem>
                          <FooterItem>{stock.currency}</FooterItem>
                        </CardFooter>
                      </StockCard>
                    ))}
                  </Grid>
                </GroupSection>
              ))}
            </GroupsContainer>
          )}
        </ContentArea>
      </StyledContainer>
    </ScreenerLayout>
  );
};

// ─── Estilos ─────────────────────────────────────────────────────────────────

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const ScreenerLayout = styled.div`
  padding: 2rem 0;
  min-height: calc(100vh - 80px);
  background-color: #0f172a;
  color: #e2e8f0;
  animation: ${fadeIn} 0.5s ease-out;
`;

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const TitleArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Title = styled.h1`
  font-family: 'Unbounded', sans-serif;
  font-size: 2.2rem;
  color: white;
  margin: 0;
  background: linear-gradient(135deg, #fff 0%, #cbd5e1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const Subtitle = styled.p`
  color: #94a3b8;
  font-size: 1.1rem;
  margin: 0;
  max-width: 600px;
`;

const ActionsArea = styled.div`
  display: flex;
  gap: 1rem;
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .spin {
    animation: ${spin} 1s linear infinite;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  background: rgba(15, 23, 42, 0.6);
  padding: 0.5rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  width: fit-content;
`;

const Tab = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  border: none;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: ${props => props.$active ? `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primaryDark} 100%)` : 'transparent'};
  color: ${props => props.$active ? 'white' : '#94a3b8'};
  box-shadow: ${props => props.$active ? `0 4px 12px ${withOpacity(colors.primary, 0.3)}` : 'none'};

  &:hover {
    color: white;
    background: ${props => props.$active ? '' : 'rgba(255, 255, 255, 0.05)'};
  }
`;

const ContentArea = styled.div`
  background: #1e293b;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 2rem;
  min-height: 500px;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #94a3b8;
  gap: 1rem;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #f43f5e;
  gap: 1rem;
`;

const GroupsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3rem;
`;

const GroupSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const GroupTitle = styled.h2`
  font-family: 'Unbounded', sans-serif;
  font-size: 1.5rem;
  color: white;
  margin: 0;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
`;

const StockCard = styled.div`
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    background: rgba(30, 41, 59, 0.8);
    transform: translateY(-3px);
    box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.2);
    border-color: rgba(255, 255, 255, 0.1);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Symbol = styled.h3`
  font-family: 'Unbounded', sans-serif;
  font-size: 1.3rem;
  color: white;
  margin: 0;
  letter-spacing: 0.05em;
`;

const TypeBadge = styled.span`
  background: rgba(255, 255, 255, 0.1);
  color: #cbd5e1;
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
  text-transform: uppercase;
`;

const CompanyName = styled.p`
  color: #94a3b8;
  font-size: 0.85rem;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PriceSection = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  margin-top: 0.5rem;
`;

const Price = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
`;

const ChangeBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: ${props => props.$isPositive ? '#34d399' : '#f43f5e'};
  background: ${props => props.$isPositive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)'};
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
`;

const FooterItem = styled.span`
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
`;

export default ScreenerPage;
