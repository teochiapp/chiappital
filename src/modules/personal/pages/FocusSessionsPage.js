import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { usePersonalHub } from '../../../context/PersonalHubContext';
import { Clock, Plus, Trash2, Edit2, Play, CheckCircle } from 'lucide-react';
import { colors } from '../../../styles/colors';

const p = colors.personal;

const FocusSessionsPage = () => {
  const { focusSessions, loading, createFocusSession, updateFocusSession, deleteFocusSession, activeFocusSession } = usePersonalHub();
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    description: '',
    duration: 30,
    session_date: '',
    session_time: ''
  });

  if (loading) return <Container><LoadingText>Cargando...</LoadingText></Container>;

  const handleOpenForm = (session = null) => {
    if (session) {
      const d = new Date(session.session_date);
      setFormData({
        description: session.description,
        duration: session.duration,
        session_date: d.toISOString().split('T')[0],
        session_time: d.toTimeString().slice(0,5)
      });
      setEditingId(session.id);
    } else {
      const now = new Date();
      now.setMinutes(now.getMinutes() + 10);
      setFormData({
        description: '',
        duration: 30,
        session_date: now.toISOString().split('T')[0],
        session_time: now.toTimeString().slice(0,5)
      });
      setEditingId(null);
    }
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Construct datetime
    const sessionDate = new Date(`${formData.session_date}T${formData.session_time}:00`);
    
    const payload = {
      description: formData.description,
      duration: parseInt(formData.duration, 10),
      session_date: sessionDate.toISOString().replace('T', ' ').slice(0, 19) // format for MySQL DATETIME
    };

    if (editingId) {
      await updateFocusSession(editingId, payload);
    } else {
      await createFocusSession(payload);
    }
    
    handleCloseForm();
  };

  const handleStatusChange = async (id, status) => {
    await updateFocusSession(id, { status });
  };

  return (
    <Container>
      <TopBar>
        <div>
          <PageTitle>Focus Sessions</PageTitle>
          <PageSubtitle>Programa tus sesiones de enfoque</PageSubtitle>
        </div>
        <AddBtn onClick={() => handleOpenForm()}>
          <Plus size={18} /> Nueva Sesión
        </AddBtn>
      </TopBar>

      {showForm && (
        <FormCard>
          <FormTitle>{editingId ? 'Editar Sesión' : 'Nueva Sesión'}</FormTitle>
          <Form onSubmit={handleSubmit}>
            <FormRow>
              <FormGroup style={{ flex: 2 }}>
                <Label>Descripción</Label>
                <Input 
                  required
                  placeholder="Ej: Estudiar React"
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </FormGroup>
              <FormGroup>
                <Label>Duración (minutos)</Label>
                <Input 
                  required
                  type="number"
                  min="5"
                  max="240"
                  value={formData.duration}
                  onChange={e => setFormData({...formData, duration: e.target.value})}
                />
              </FormGroup>
            </FormRow>
            <FormRow>
              <FormGroup>
                <Label>Fecha</Label>
                <Input 
                  required
                  type="date"
                  value={formData.session_date}
                  onChange={e => setFormData({...formData, session_date: e.target.value})}
                />
              </FormGroup>
              <FormGroup>
                <Label>Hora</Label>
                <Input 
                  required
                  type="time"
                  value={formData.session_time}
                  onChange={e => setFormData({...formData, session_time: e.target.value})}
                />
              </FormGroup>
            </FormRow>
            <FormActions>
              <CancelBtn type="button" onClick={handleCloseForm}>Cancelar</CancelBtn>
              <SaveBtn type="submit">Guardar</SaveBtn>
            </FormActions>
          </Form>
        </FormCard>
      )}

      {activeFocusSession && (
        <ActiveAlert>
          <Clock size={20} />
          <span>¡Tienes una sesión activa o por comenzar! <strong>{activeFocusSession.description}</strong></span>
        </ActiveAlert>
      )}

      <SessionGrid>
        {focusSessions.length === 0 ? (
          <EmptyState>No hay sesiones programadas.</EmptyState>
        ) : (
          focusSessions.map(session => (
            <SessionCard key={session.id} $status={session.status}>
              <SessionHeader>
                <SessionTitle>{session.description}</SessionTitle>
                <StatusBadge $status={session.status}>
                  {session.status === 'completed' ? 'Completada' : session.status === 'cancelled' ? 'Cancelada' : 'Pendiente'}
                </StatusBadge>
              </SessionHeader>
              <SessionDetails>
                <DetailItem>
                  <Clock size={14} /> {new Date(session.session_date).toLocaleString()}
                </DetailItem>
                <DetailItem>
                  <Play size={14} /> {session.duration} min
                </DetailItem>
              </SessionDetails>
              
              <SessionActions>
                {session.status === 'pending' && (
                  <>
                    <ActionBtn onClick={() => handleStatusChange(session.id, 'completed')} title="Marcar como completada">
                      <CheckCircle size={16} color="#34d399" />
                    </ActionBtn>
                    <ActionBtn onClick={() => handleOpenForm(session)} title="Editar">
                      <Edit2 size={16} />
                    </ActionBtn>
                  </>
                )}
                <ActionBtn onClick={() => handleOpenForm(session)} title="Reusar (Crear copia)">
                  <Plus size={16} />
                </ActionBtn>
                <ActionBtn onClick={() => deleteFocusSession(session.id)} title="Eliminar">
                  <Trash2 size={16} color="#f87171" />
                </ActionBtn>
              </SessionActions>
            </SessionCard>
          ))
        )}
      </SessionGrid>
    </Container>
  );
};

// --- Styles ---

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  color: #e2e8f0;
  padding: 2rem;
  animation: ${fadeUp} 0.35s ease-out;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 1.25rem 1rem;
  }
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;
`;

const PageTitle = styled.h1`
  font-family: 'Unbounded', sans-serif;
  font-size: 1.75rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.25rem 0;
`;

const PageSubtitle = styled.p`
  color: #64748b;
  margin: 0;
  font-size: 0.95rem;
`;

const AddBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${p.primary};
  color: #0f172a;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1rem;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: opacity 0.2s;
  &:hover { opacity: 0.9; }
`;

const FormCard = styled.div`
  background: #0f172a;
  border: 1px solid rgba(82, 183, 136, 0.3);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
`;

const FormTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: white;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const FormRow = styled.div`
  display: flex;
  gap: 1rem;
  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  flex: 1;
`;

const Label = styled.label`
  font-size: 0.85rem;
  color: #94a3b8;
`;

const Input = styled.input`
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px;
  color: white;
  padding: 0.6rem;
  font-family: inherit;
  outline: none;
  &:focus {
    border-color: ${p.primaryLight};
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 0.5rem;
`;

const CancelBtn = styled.button`
  background: transparent;
  border: 1px solid rgba(255,255,255,0.1);
  color: #94a3b8;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  &:hover { color: white; }
`;

const SaveBtn = styled.button`
  background: ${p.primaryLight};
  border: none;
  color: #0f172a;
  padding: 0.5rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  &:hover { opacity: 0.9; }
`;

const ActiveAlert = styled.div`
  background: rgba(245, 158, 11, 0.15);
  border: 1px solid rgba(245, 158, 11, 0.4);
  color: #fcd34d;
  padding: 1rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
  font-weight: 500;
`;

const SessionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const SessionCard = styled.div`
  background: #0f172a;
  border: 1px solid ${props => props.$status === 'pending' ? 'rgba(82, 183, 136, 0.3)' : 'rgba(255,255,255,0.05)'};
  border-radius: 12px;
  padding: 1.25rem;
  opacity: ${props => props.$status === 'cancelled' ? 0.6 : 1};
  position: relative;
`;

const SessionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
`;

const SessionTitle = styled.div`
  font-weight: 600;
  color: white;
  font-size: 1.05rem;
`;

const StatusBadge = styled.div`
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  border-radius: 10px;
  background: ${props => {
    if (props.$status === 'completed') return 'rgba(52, 211, 153, 0.15)';
    if (props.$status === 'cancelled') return 'rgba(248, 113, 113, 0.15)';
    return 'rgba(251, 191, 36, 0.15)';
  }};
  color: ${props => {
    if (props.$status === 'completed') return '#34d399';
    if (props.$status === 'cancelled') return '#f87171';
    return '#fbbf24';
  }};
`;

const SessionDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  margin-bottom: 1.25rem;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #94a3b8;
  font-size: 0.85rem;
`;

const SessionActions = styled.div`
  display: flex;
  gap: 0.5rem;
  border-top: 1px solid rgba(255,255,255,0.05);
  padding-top: 1rem;
`;

const ActionBtn = styled.button`
  background: rgba(255,255,255,0.03);
  border: none;
  border-radius: 6px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    background: rgba(255,255,255,0.1);
    color: white;
  }
`;

const EmptyState = styled.div`
  color: #64748b;
  padding: 3rem;
  text-align: center;
  border: 1px dashed rgba(255,255,255,0.1);
  border-radius: 12px;
  grid-column: 1 / -1;
`;

const LoadingText = styled.div`
  color: #64748b;
  padding: 4rem;
  text-align: center;
`;

export default FocusSessionsPage;
