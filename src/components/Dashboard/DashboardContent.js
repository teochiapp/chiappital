import React from 'react';
import { StyledContainer } from '../common/StyledComponents';
import OverviewMetrics from './OverviewMetrics';
import PortfolioComposition from './PortfolioComposition';
import HistoricalMetrics from './HistoricalMetrics';
import {
  DashboardContentStyled,
  DashboardSplitLayout
} from './styled/DashboardStyles';

const DashboardContent = () => {
  return (
    <DashboardContentStyled>
      <StyledContainer>
        <DashboardSplitLayout>
          <OverviewMetrics />
          <PortfolioComposition />
        </DashboardSplitLayout>
        <HistoricalMetrics />
      </StyledContainer>
    </DashboardContentStyled>
  );
};

export default DashboardContent;