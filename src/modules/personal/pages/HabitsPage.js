// modules/personal/pages/HabitsPage.js — Habit Tracker completo
import React, { useState, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import {
  CheckCircle2, Circle, Plus, Trash2, Edit3, X, Flame,
  Calendar, BarChart2, ChevronLeft, ChevronRight, Save
} from 'lucide-react';
import { usePersonalHub } from '../../../context/PersonalHubContext';
import { colors } from '../../../styles/colors';

const p = colors.personal;

const HABIT_COLORS = ['#52B788', '#60a5fa', '#f472b6', '#fb923c', '#a78bfa', '#fbbf24', '#f43f5e', '#34d399'];

const HabitsPage = () => {
  const { habits, loading, createHabit, updateHabit, deleteHabit, toggleHabit } = usePersonalHub();
  const [showForm, setShowForm] = useState(false);
  const [editingHabit, setEditingHabit] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', color: '#52B788', frequency: 'daily' });
  const [calendarOffset, setCalendarOffset] = useState(0); // months back

  const today = new Date().toISOString().split('T')[0];

  // Calcular racha para un hábito
  const getStreak = (habit) => {
    let streak = 0;
    const d = new Date();
    while (true) {
      const ds = d.toISOString().split('T')[0];
      if ((habit.completions || []).includes(ds)) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else if (ds === today) {
        // Hoy aún no completado, no rompe racha
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
      if (streak > 365) break;
    }
    return streak;
  };

  // Calcular porcentaje de los últimos 30 días
  const getCompletionRate = (habit) => {
    let completed = 0;
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      if ((habit.completions || []).includes(d.toISOString().split('T')[0])) completed++;
    }
    return Math.round((completed / 30) * 100);
  };

  // Generar días del mes actual (o pasados según offset)
  const calendarDays = useMemo(() => {
    const now = new Date();
    now.setMonth(now.getMonth() - calendarOffset);
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(year, month, i + 1);
      return d.toISOString().split('T')[0];
    });
  }, [calendarOffset]);

  const calendarMonth = useMemo(() => {
    const now = new Date();
    now.setMonth(now.getMonth() - calendarOffset);
    return now.toLocaleDateString('es', { month: 'long', year: 'numeric' });
  }, [calendarOffset]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    if (editingHabit) {
      await updateHabit(editingHabit.id, formData);
    } else {
      await createHabit(formData);
    }
    setShowForm(false);
    setEditingHabit(null);
    setFormData({ name: '', description: '', color: '#52B788', frequency: 'daily' });
  };

  const handleEdit = (habit) => {
    setEditingHabit(habit);
    setFormData({ name: habit.name, description: habit.description || '', color: habit.color || '#52B788', frequency: habit.frequency || 'daily' });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar este hábito?')) {
      await deleteHabit(id);
    }
  };

  const handleToggle = async (id) => {
    await toggleHabit(id);
  };

  if (loading) return <Container><LoadingText>Cargando...</LoadingText></Container>;

  return (
    <Container>
      <TopBar>
        <div>
          <PageTitle>Hábitos</PageTitle>
          <PageSubtitle>Construye tu mejor versión, un día a la vez</PageSubtitle>
        </div>
        <AddButton onClick={() => { setEditingHabit(null); setFormData({ name: '', description: '', color: '#52B788', frequency: 'daily' }); setShowForm(true); }}>
          <Plus size={18} /> Nuevo hábito
        </AddButton>
      </TopBar>

      {/* Formulario */}
      {showForm && (
        <FormOverlay>
          <FormCard>
            <FormHeader>
              <FormTitle>{editingHabit ? 'Editar hábito' : 'Nuevo hábito'}</FormTitle>
              <CloseBtn onClick={() => setShowForm(false)}><X size={18} /></CloseBtn>
            </FormHeader>
            <form onSubmit={handleSubmit}>
              <FormGroup>
                <Label>Nombre *</Label>
                <Input
                  type="text"
                  placeholder="Ej: Leer 30 minutos"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  autoFocus
                />
              </FormGroup>
              <FormGroup>
                <Label>Descripción</Label>
                <Input
                  type="text"
                  placeholder="Opcional..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </FormGroup>
              <FormGroup>
                <Label>Color</Label>
                <ColorRow>
                  {HABIT_COLORS.map(c => (
                    <ColorSwatch
                      key={c}
                      style={{ background: c }}
                      $selected={formData.color === c}
                      onClick={() => setFormData({ ...formData, color: c })}
                      type="button"
                    />
                  ))}
                </ColorRow>
              </FormGroup>
              <FormActions>
                <CancelBtn type="button" onClick={() => setShowForm(false)}>Cancelar</CancelBtn>
                <SubmitBtn type="submit"><Save size={16} /> {editingHabit ? 'Guardar' : 'Crear'}</SubmitBtn>
              </FormActions>
            </form>
          </FormCard>
        </FormOverlay>
      )}

      {habits.length === 0 ? (
        <EmptyState>
          <EmptyIcon>🌱</EmptyIcon>
          <EmptyTitle>Aún no tenés hábitos</EmptyTitle>
          <EmptyText>Empieza con uno pequeño. La consistencia es todo.</EmptyText>
          <AddButton onClick={() => setShowForm(true)}><Plus size={18} /> Crear primer hábito</AddButton>
        </EmptyState>
      ) : (
        <>
          {/* Lista de hábitos con toggles */}
          <HabitGrid>
            {habits.map(habit => {
              const completedToday = (habit.completions || []).includes(today);
              const streak = getStreak(habit);
              const rate = getCompletionRate(habit);
              return (
                <HabitCard key={habit.id} $done={completedToday} $color={habit.color}>
                  <HabitCardLeft>
                    <ToggleBtn onClick={() => handleToggle(habit.id)} $done={completedToday}>
                      {completedToday ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                    </ToggleBtn>
                    <HabitInfo>
                      <HabitName $done={completedToday}>{habit.name}</HabitName>
                      {habit.description && <HabitDesc>{habit.description}</HabitDesc>}
                    </HabitInfo>
                  </HabitCardLeft>
                  <HabitCardRight>
                    <HabitStat>
                      <Flame size={14} color="#fb923c" />
                      <span>{streak}d</span>
                    </HabitStat>
                    <HabitStat>
                      <BarChart2 size={14} color={p.primaryLight} />
                      <span>{rate}%</span>
                    </HabitStat>
                    <ActionBtn onClick={() => handleEdit(habit)} title="Editar"><Edit3 size={14} /></ActionBtn>
                    <ActionBtn onClick={() => handleDelete(habit.id)} title="Eliminar" $danger><Trash2 size={14} /></ActionBtn>
                  </HabitCardRight>
                </HabitCard>
              );
            })}
          </HabitGrid>

          {/* Calendario de actividad */}
          <CalendarSection>
            <CalendarHeader>
              <CalendarNav onClick={() => setCalendarOffset(o => o + 1)}><ChevronLeft size={18} /></CalendarNav>
              <CalendarMonth>{calendarMonth}</CalendarMonth>
              <CalendarNav onClick={() => setCalendarOffset(o => Math.max(0, o - 1))} $disabled={calendarOffset === 0}>
                <ChevronRight size={18} />
              </CalendarNav>
            </CalendarHeader>
            <CalendarLegend>
              <LegendItem><LegendDot style={{ background: 'rgba(255,255,255,0.06)' }} /> Sin hábitos</LegendItem>
              <LegendItem><LegendDot style={{ background: `${p.primaryLight}60` }} /> Parcial</LegendItem>
              <LegendItem><LegendDot style={{ background: p.primaryLight }} /> Completo</LegendItem>
            </CalendarLegend>
            <CalendarGrid>
              {['L','M','X','J','V','S','D'].map(d => <WeekdayLabel key={d}>{d}</WeekdayLabel>)}
              {/* padding del primer día del mes */}
              {Array.from({ length: (new Date(calendarDays[0]).getDay() + 6) % 7 }, (_, i) => (
                <CalDay key={`pad-${i}`} style={{ background: 'transparent' }} />
              ))}
              {calendarDays.map(dateStr => {
                const totalDone = habits.filter(h => (h.completions || []).includes(dateStr)).length;
                const pct = habits.length > 0 ? totalDone / habits.length : 0;
                const isToday = dateStr === today;
                const isFuture = dateStr > today;
                return (
                  <CalDay
                    key={dateStr}
                    $pct={pct}
                    $isToday={isToday}
                    $isFuture={isFuture}
                    title={`${dateStr}: ${totalDone}/${habits.length} hábitos`}
                  >
                    {isToday && <TodayDot />}
                  </CalDay>
                );
              })}
            </CalendarGrid>
          </CalendarSection>
        </>
      )}
    </Container>
  );
};

// ─── Animations ───────────────────────────────────────────────────────────────
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

// ─── Styled Components ────────────────────────────────────────────────────────
const Container = styled.div`
  color: #e2e8f0;
  padding: 2rem;
  animation: ${fadeUp} 0.35s ease-out;
  max-width: 1000px;
  margin: 0 auto;
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

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(135deg, ${p.primary}, ${p.primaryLight});
  color: white;
  border: none;
  border-radius: 10px;
  padding: 0.75rem 1.25rem;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { opacity: 0.9; transform: translateY(-1px); }
`;

const HabitGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;
`;

const HabitCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${props => props.$done ? 'rgba(82,183,136,0.07)' : '#0f172a'};
  border: 1px solid ${props => props.$done ? `${props.$color}40` : 'rgba(255,255,255,0.05)'};
  border-left: 3px solid ${props => props.$color || p.primaryLight};
  border-radius: 12px;
  padding: 1rem 1.25rem;
  transition: all 0.2s;
  &:hover { transform: translateX(2px); }
`;

const HabitCardLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ToggleBtn = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${props => props.$done ? p.primaryLight : '#475569'};
  display: flex;
  transition: all 0.2s;
  padding: 0;
  &:hover { transform: scale(1.1); }
`;

const HabitInfo = styled.div``;

const HabitName = styled.div`
  font-weight: 600;
  font-size: 1rem;
  color: ${props => props.$done ? '#64748b' : 'white'};
  text-decoration: ${props => props.$done ? 'line-through' : 'none'};
`;

const HabitDesc = styled.div`
  font-size: 0.82rem;
  color: #475569;
  margin-top: 0.15rem;
`;

const HabitCardRight = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const HabitStat = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.82rem;
  color: #94a3b8;
`;

const ActionBtn = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${props => props.$danger ? '#f43f5e' : '#64748b'};
  display: flex;
  padding: 0.25rem;
  border-radius: 6px;
  transition: all 0.2s;
  &:hover {
    background: ${props => props.$danger ? 'rgba(244,63,94,0.1)' : 'rgba(255,255,255,0.05)'};
    color: ${props => props.$danger ? '#f43f5e' : 'white'};
  }
`;

const CalendarSection = styled.div`
  background: #0f172a;
  border: 1px solid rgba(255,255,255,0.05);
  border-radius: 16px;
  padding: 1.5rem;
`;

const CalendarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

const CalendarNav = styled.button`
  background: transparent;
  border: none;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  color: ${props => props.$disabled ? '#1e293b' : '#64748b'};
  display: flex;
  padding: 0.4rem;
  border-radius: 8px;
  transition: all 0.2s;
  &:hover:not(:disabled) { background: rgba(255,255,255,0.05); color: white; }
`;

const CalendarMonth = styled.span`
  font-weight: 600;
  font-size: 1rem;
  color: white;
  text-transform: capitalize;
  min-width: 160px;
  text-align: center;
`;

const CalendarLegend = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 1rem;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.78rem;
  color: #64748b;
`;

const LegendDot = styled.div`
  width: 14px;
  height: 14px;
  border-radius: 4px;
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
`;

const WeekdayLabel = styled.div`
  text-align: center;
  font-size: 0.72rem;
  color: #475569;
  font-weight: 600;
  padding: 0.25rem 0;
`;

const CalDay = styled.div`
  aspect-ratio: 1;
  border-radius: 6px;
  position: relative;
  background: ${props => {
    if (props.$isFuture) return 'rgba(255,255,255,0.02)';
    if (props.$pct === 0) return 'rgba(255,255,255,0.04)';
    if (props.$pct < 0.5) return `${p.primaryLight}40`;
    if (props.$pct < 1) return `${p.primaryLight}80`;
    return p.primaryLight;
  }};
  outline: ${props => props.$isToday ? `2px solid ${p.primaryLight}` : 'none'};
  cursor: default;
  transition: background 0.3s;
`;

const TodayDot = styled.div`
  position: absolute;
  bottom: 3px;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: white;
`;

// Form overlay
const FormOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeUp} 0.2s ease-out;
`;

const FormCard = styled.div`
  background: #0f172a;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 18px;
  padding: 2rem;
  width: 100%;
  max-width: 480px;
`;

const FormHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const FormTitle = styled.h2`
  font-family: 'Unbounded', sans-serif;
  font-size: 1.2rem;
  font-weight: 700;
  color: white;
  margin: 0;
`;

const CloseBtn = styled.button`
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  display: flex;
  padding: 0.25rem;
  &:hover { color: white; }
`;

const FormGroup = styled.div`
  margin-bottom: 1.25rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  color: #94a3b8;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  width: 100%;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 10px;
  color: white;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;
  &:focus { border-color: ${p.primaryLight}; }
  &::placeholder { color: #475569; }
`;

const ColorRow = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const ColorSwatch = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid ${props => props.$selected ? 'white' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s;
  transform: ${props => props.$selected ? 'scale(1.15)' : 'scale(1)'};
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
`;

const CancelBtn = styled.button`
  background: transparent;
  border: 1px solid rgba(255,255,255,0.1);
  color: #94a3b8;
  border-radius: 8px;
  padding: 0.6rem 1.2rem;
  cursor: pointer;
  font-size: 0.9rem;
  &:hover { color: white; border-color: rgba(255,255,255,0.2); }
`;

const SubmitBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: linear-gradient(135deg, ${p.primary}, ${p.primaryLight});
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1.25rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  &:hover { opacity: 0.9; }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  gap: 1rem;
  text-align: center;
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
`;

const EmptyTitle = styled.h2`
  color: white;
  font-size: 1.25rem;
  margin: 0;
`;

const EmptyText = styled.p`
  color: #64748b;
  margin: 0;
`;

const LoadingText = styled.div`
  color: #64748b;
  padding: 4rem;
  text-align: center;
`;

export default HabitsPage;
