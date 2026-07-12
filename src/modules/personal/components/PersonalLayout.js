import React from 'react';
import styled from 'styled-components';
import { Outlet } from 'react-router-dom';
import PersonalHeader from './PersonalHeader';

const LayoutWrapper = styled.div`
  min-height: 100vh;
  background: #0a0f1e;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.main`
  flex: 1;
`;

const PersonalLayout = () => {
  return (
    <LayoutWrapper>
      <PersonalHeader />
      <MainContent>
        <Outlet />
      </MainContent>
    </LayoutWrapper>
  );
};

export default PersonalLayout;
