import React, { useState, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { usePersonalHub } from '../../../context/PersonalHubContext';
import { BookOpen, Plus, Search, Trash2, CheckCircle, HelpCircle, AlertCircle, RotateCcw, Globe } from 'lucide-react';

const p = {
  primary: '#3b82f6',
  primaryLight: '#60a5fa',
  bgDark: '#0f172a',
  bgCard: '#1e293b',
  textMain: '#f8fafc',
  textMuted: '#94a3b8'
};

const LanguagesPage = () => {
  const { vocabulary, createVocabulary, reviewVocabulary, deleteVocabulary, loading } = usePersonalHub();
  const [activeTab, setActiveTab] = useState('review'); // 'review' | 'list'
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [newWord, setNewWord] = useState('');
  const [newTranslation, setNewTranslation] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Flashcard states
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentReviewIndex, setCurrentReviewIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const dueVocab = useMemo(() => {
    return vocabulary.filter(w => {
      const nextRevStr = w.next_review ? new Date(w.next_review).toISOString().split('T')[0] : todayStr;
      return nextRevStr <= todayStr;
    });
  }, [vocabulary, todayStr]);

  const currentWord = dueVocab[currentReviewIndex];

  const handleAddWord = async (e) => {
    e.preventDefault();
    if (!newWord.trim() || !newTranslation.trim()) return;
    await createVocabulary({
      word: newWord,
      translation: newTranslation,
      language: 'portugués',
      notes: newNotes
    });
    setNewWord('');
    setNewTranslation('');
    setNewNotes('');
    setShowAddModal(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar esta palabra?')) {
      await deleteVocabulary(id);
    }
  };

  const handleReview = async (quality) => {
    if (!currentWord || isProcessing) return;
    
    setIsProcessing(true);
    // Primero giramos la tarjeta
    setIsFlipped(false);
    
    // Guardamos el ID antes del delay
    const wordId = currentWord.id;
    
    // Esperamos 1 segundo antes de actualizar la palabra
    setTimeout(async () => {
      await reviewVocabulary(wordId, quality);
      setIsProcessing(false);
    }, 1000);
  };

  if (loading) {
    return <Container><p>Cargando idiomas...</p></Container>;
  }

  return (
    <Container>
      <TopSection>
        <PageTitle>
          <Globe size={28} color={p.primaryLight} /> Idiomas
        </PageTitle>
        <PageSubtitle>Domina nuevos vocabularios con repetición espaciada</PageSubtitle>
      </TopSection>

      <StatusSection>
        <LangBadge $active={true}>
          <LangFlag>🇬🇧</LangFlag> Inglés (Fluido)
        </LangBadge>
        <LangBadge $active={true}>
          <LangFlag>🇦🇷</LangFlag> Español (Nativo)
        </LangBadge>
        <LangBadge $active={true} $learning>
          <LangFlag>🇧🇷</LangFlag> Portugués (Aprendiendo)
        </LangBadge>
      </StatusSection>

      <Tabs>
        <Tab $active={activeTab === 'review'} onClick={() => { setActiveTab('review'); setIsFlipped(false); }}>
          Modo Repaso ({dueVocab.length})
        </Tab>
        <Tab $active={activeTab === 'list'} onClick={() => setActiveTab('list')}>
          Mi Vocabulario ({vocabulary.length})
        </Tab>
      </Tabs>

      {activeTab === 'review' && (
        <ReviewContainer>
          {dueVocab.length > 0 ? (
            <FlashcardWrapper>
              <Flashcard $flipped={isFlipped} onClick={() => {
                if (!isProcessing) setIsFlipped(true);
              }}>
                <CardFront>
                  <CardLabel>¿Qué significa?</CardLabel>
                  <CardWord>{currentWord.word}</CardWord>
                  <CardHint>Toca para ver la respuesta</CardHint>
                </CardFront>
                <CardBack>
                  <CardLabel>Traducción</CardLabel>
                  <CardTranslation>{currentWord.translation}</CardTranslation>
                  {currentWord.notes && <CardNotes>{currentWord.notes}</CardNotes>}
                </CardBack>
              </Flashcard>

              {isFlipped && (
                <ActionButtons>
                  <EvalBtn $color="#ef4444" onClick={(e) => { e.stopPropagation(); handleReview(0); }}>
                    <RotateCcw size={18} />
                    <span>Otra vez<br/><small>(1d)</small></span>
                  </EvalBtn>
                  <EvalBtn $color="#f59e0b" onClick={(e) => { e.stopPropagation(); handleReview(1); }}>
                    <AlertCircle size={18} />
                    <span>Difícil<br/><small>({currentWord.repetition === 0 ? '1d' : '6d'})</small></span>
                  </EvalBtn>
                  <EvalBtn $color="#10b981" onClick={(e) => { e.stopPropagation(); handleReview(2); }}>
                    <CheckCircle size={18} />
                    <span>Bien<br/><small>(~{Math.round((currentWord.interval_days || 1) * 2.5)}d)</small></span>
                  </EvalBtn>
                  <EvalBtn $color="#3b82f6" onClick={(e) => { e.stopPropagation(); handleReview(3); }}>
                    <CheckCircle size={18} />
                    <span>Fácil<br/><small>(~{Math.round((currentWord.interval_days || 1) * 2.8)}d)</small></span>
                  </EvalBtn>
                </ActionButtons>
              )}
            </FlashcardWrapper>
          ) : (
            <AllDoneState>
              <CheckCircle size={48} color="#10b981" />
              <h3>¡Todo al día!</h3>
              <p>No tienes más palabras para repasar hoy.</p>
            </AllDoneState>
          )}
        </ReviewContainer>
      )}

      {activeTab === 'list' && (
        <ListContainer>
          <ListHeader>
            <SearchBox>
              <Search size={16} />
              <input type="text" placeholder="Buscar palabras..." disabled />
            </SearchBox>
            <AddBtn onClick={() => setShowAddModal(true)}>
              <Plus size={16} /> Nueva Palabra
            </AddBtn>
          </ListHeader>

          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <th>Palabra</th>
                  <th>Traducción</th>
                  <th>Próximo Repaso</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {vocabulary.map(word => (
                  <tr key={word.id}>
                    <td><strong>{word.word}</strong></td>
                    <td>{word.translation}</td>
                    <td>{new Date(word.next_review).toLocaleDateString()}</td>
                    <td>
                      <DelBtn onClick={() => handleDelete(word.id)}><Trash2 size={16} /></DelBtn>
                    </td>
                  </tr>
                ))}
                {vocabulary.length === 0 && (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>No hay vocabulario guardado.</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </TableWrapper>
        </ListContainer>
      )}

      {showAddModal && (
        <ModalOverlay onClick={() => setShowAddModal(false)}>
          <ModalContent onClick={e => e.stopPropagation()}>
            <ModalTitle>Agregar Palabra</ModalTitle>
            <form onSubmit={handleAddWord}>
              <FormGroup>
                <label>Palabra (Portugués)</label>
                <Input value={newWord} onChange={e => setNewWord(e.target.value)} required autoFocus />
              </FormGroup>
              <FormGroup>
                <label>Traducción (Español)</label>
                <Input value={newTranslation} onChange={e => setNewTranslation(e.target.value)} required />
              </FormGroup>
              <FormGroup>
                <label>Notas o Ejemplos (Opcional)</label>
                <Input as="textarea" rows="2" value={newNotes} onChange={e => setNewNotes(e.target.value)} />
              </FormGroup>
              <ModalActions>
                <CancelBtn type="button" onClick={() => setShowAddModal(false)}>Cancelar</CancelBtn>
                <SaveBtn type="submit">Guardar</SaveBtn>
              </ModalActions>
            </form>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  padding: 2rem;
  color: ${p.textMain};
  max-width: 1000px;
  margin: 0 auto;
  animation: ${fadeUp} 0.4s ease-out;
`;

const TopSection = styled.div`
  margin-bottom: 2rem;
`;

const PageTitle = styled.h1`
  font-size: 1.8rem;
  font-family: 'Unbounded', sans-serif;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const PageSubtitle = styled.p`
  color: ${p.textMuted};
`;

const StatusSection = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const LangBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${props => props.$learning ? `${p.primary}20` : 'rgba(255,255,255,0.05)'};
  border: 1px solid ${props => props.$learning ? p.primary : 'rgba(255,255,255,0.1)'};
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  color: ${props => props.$learning ? p.primaryLight : '#fff'};
`;

const LangFlag = styled.span`
  font-size: 1.2rem;
`;

const Tabs = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  padding-bottom: 0.5rem;
`;

const Tab = styled.button`
  background: none;
  border: none;
  color: ${props => props.$active ? '#fff' : p.textMuted};
  font-family: 'Unbounded', sans-serif;
  font-size: 1rem;
  font-weight: ${props => props.$active ? '600' : '400'};
  cursor: pointer;
  position: relative;
  padding: 0.5rem;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -0.6rem;
    left: 0;
    width: 100%;
    height: 2px;
    background: ${p.primary};
    transform: scaleX(${props => props.$active ? 1 : 0});
    transition: transform 0.2s;
  }
`;

// Review Mode

const ReviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 3rem;
`;

const FlashcardWrapper = styled.div`
  width: 100%;
  max-width: 500px;
  perspective: 1000px;
`;

const Flashcard = styled.div`
  width: 100%;
  aspect-ratio: 4/3;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1);
  transform: ${props => props.$flipped ? 'rotateY(180deg)' : 'rotateY(0)'};
  cursor: pointer;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
  border-radius: 16px;
`;

const CardFace = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  text-align: center;
  background: ${p.bgCard};
  border: 1px solid rgba(255,255,255,0.05);
`;

const CardFront = styled(CardFace)`
  /* Front is default */
`;

const CardBack = styled(CardFace)`
  transform: rotateY(180deg);
  background: linear-gradient(135deg, ${p.bgCard}, #1e293b);
`;

const CardLabel = styled.span`
  font-size: 0.8rem;
  color: ${p.textMuted};
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 1rem;
`;

const CardWord = styled.h2`
  font-size: 2.5rem;
  font-family: 'Unbounded', sans-serif;
  margin: 0;
  color: #fff;
`;

const CardHint = styled.p`
  position: absolute;
  bottom: 1.5rem;
  font-size: 0.8rem;
  color: ${p.textMuted};
`;

const CardTranslation = styled.h2`
  font-size: 2.2rem;
  font-family: 'Unbounded', sans-serif;
  margin: 0 0 1rem 0;
  color: ${p.primaryLight};
`;

const CardNotes = styled.p`
  font-size: 1rem;
  color: #cbd5e1;
  font-style: italic;
`;

const ActionButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
  margin-top: 2rem;
  animation: ${fadeUp} 0.3s ease-out;
`;

const EvalBtn = styled.button`
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 1rem 0.5rem;
  color: #fff;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  
  span {
    font-size: 0.85rem;
    font-weight: 500;
  }
  
  small {
    color: ${p.textMuted};
    font-size: 0.7rem;
  }

  svg {
    color: ${props => props.$color};
  }

  &:hover {
    background: ${props => props.$color}15;
    border-color: ${props => props.$color}50;
    transform: translateY(-2px);
  }
`;

const AllDoneState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  color: ${p.textMuted};
  padding: 4rem 2rem;
  background: ${p.bgCard};
  border-radius: 16px;
  border: 1px dashed rgba(255,255,255,0.1);
  
  h3 {
    margin: 1rem 0 0.5rem 0;
    color: #fff;
  }
`;

// List Mode

const ListContainer = styled.div``;

const ListHeader = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const SearchBox = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255,255,255,0.05);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  width: 300px;
  
  input {
    background: transparent;
    border: none;
    color: #fff;
    outline: none;
    width: 100%;
  }
`;

const AddBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${p.primary};
  color: #fff;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  
  &:hover {
    background: ${p.primaryLight};
  }
`;

const TableWrapper = styled.div`
  background: ${p.bgCard};
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.05);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid rgba(255,255,255,0.05);
  }
  
  th {
    color: ${p.textMuted};
    font-weight: 500;
    font-size: 0.9rem;
    background: rgba(255,255,255,0.02);
  }
`;

const DelBtn = styled.button`
  background: transparent;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  
  &:hover {
    background: rgba(239, 68, 68, 0.1);
  }
`;

// Modals

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: ${p.bgCard};
  padding: 2rem;
  border-radius: 16px;
  width: 100%;
  max-width: 400px;
  border: 1px solid rgba(255,255,255,0.1);
`;

const ModalTitle = styled.h2`
  margin: 0 0 1.5rem 0;
  font-family: 'Unbounded', sans-serif;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
  label {
    display: block;
    margin-bottom: 0.5rem;
    color: ${p.textMuted};
    font-size: 0.9rem;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border-radius: 8px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.05);
  color: #fff;
  font-family: inherit;
  outline: none;
  
  &:focus {
    border-color: ${p.primary};
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
`;

const CancelBtn = styled.button`
  background: transparent;
  color: ${p.textMuted};
  border: 1px solid rgba(255,255,255,0.1);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  
  &:hover {
    color: #fff;
    background: rgba(255,255,255,0.05);
  }
`;

const SaveBtn = styled.button`
  background: ${p.primary};
  color: #fff;
  border: none;
  padding: 0.5rem 1.2rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background: ${p.primaryLight};
  }
`;

export default LanguagesPage;
