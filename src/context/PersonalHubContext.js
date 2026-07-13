// context/PersonalHubContext.js — Estado global del Personal Hub
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import personalApiService from '../modules/personal/services/personalApiService';

const PersonalHubContext = createContext();

export const usePersonalHub = () => useContext(PersonalHubContext);

export const PersonalHubProvider = ({ children }) => {
  const [features, setFeatures] = useState({ personal_hub: false, investment_hub: true });
  const [habits, setHabits] = useState([]);
  const [goals, setGoals] = useState([]);
  const [vocabulary, setVocabulary] = useState([]);
  const [fitness, setFitness] = useState({ prs: [], weekly_workouts: 0 });
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [featData, habitsData, goalsData, vocabData, fitnessData, journalsData] = await Promise.all([
        personalApiService.getFeatures(),
        personalApiService.getHabits(),
        personalApiService.getGoals(),
        personalApiService.getVocabulary(),
        personalApiService.getFitness(),
        personalApiService.getJournals().catch(() => ({ journals: [] })), // Fallback si no existe
      ]);
      setFeatures(featData.features || { personal_hub: false, investment_hub: true });
      setHabits(habitsData.habits || []);
      setGoals(goalsData.goals || []);
      setVocabulary(vocabData.vocabulary || []);
      setFitness(fitnessData || { prs: [], weekly_workouts: 0 });
      setJournals(journalsData.journals || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ─── Habits ────────────────────────────────────────────────────────────────

  const createHabit = async (habit) => {
    const data = await personalApiService.createHabit(habit);
    setHabits(prev => [...prev, data.habit]);
    return data.habit;
  };

  const updateHabit = async (id, updates) => {
    await personalApiService.updateHabit(id, updates);
    setHabits(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
  };

  const deleteHabit = async (id) => {
    await personalApiService.deleteHabit(id);
    setHabits(prev => prev.filter(h => h.id !== id));
  };

  const toggleHabit = async (id) => {
    const data = await personalApiService.toggleHabit(id);
    const today = data.date;
    setHabits(prev => prev.map(h => {
      if (h.id !== id) return h;
      const completions = data.completed
        ? [...(h.completions || []), today]
        : (h.completions || []).filter(d => d !== today);
      return { ...h, completions };
    }));
    return data;
  };

  // ─── Goals ─────────────────────────────────────────────────────────────────

  const createGoal = async (goal) => {
    const data = await personalApiService.createGoal(goal);
    setGoals(prev => [data.goal, ...prev]);
    return data.goal;
  };

  const updateGoal = async (id, updates) => {
    const data = await personalApiService.updateGoal(id, updates);
    setGoals(prev => prev.map(g => g.id === id ? data.goal : g));
    return data.goal;
  };

  const deleteGoal = async (id) => {
    await personalApiService.deleteGoal(id);
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  // ─── Vocabulary ────────────────────────────────────────────────────────────

  const createVocabulary = async (wordData) => {
    const data = await personalApiService.createVocabulary(wordData);
    setVocabulary(prev => [data.word, ...prev]);
    return data.word;
  };

  const reviewVocabulary = async (id, quality) => {
    const data = await personalApiService.reviewVocabulary(id, quality);
    setVocabulary(prev => prev.map(w => w.id === id ? data.word : w));
    return data.word;
  };

  const deleteVocabulary = async (id) => {
    await personalApiService.deleteVocabulary(id);
    setVocabulary(prev => prev.filter(w => w.id !== id));
  };

  // ─── Fitness ───────────────────────────────────────────────────────────────

  const updateFitnessPr = async (exercise, record_value) => {
    await personalApiService.updateFitnessPr(exercise, record_value);
    await fetchAll(); // Refresh todo para actualizar el PR y el "Último PR"
  };

  const logWorkout = async () => {
    await personalApiService.logWorkout();
    await fetchAll();
  };

  // ─── Journals ──────────────────────────────────────────────────────────────

  const createJournal = async (journalData) => {
    const data = await personalApiService.createJournal(journalData);
    setJournals(prev => [data.journal, ...prev]);
    return data.journal;
  };

  const updateJournal = async (id, journalData) => {
    const data = await personalApiService.updateJournal(id, journalData);
    setJournals(prev => prev.map(j => j.id === id ? data.journal : j));
    return data.journal;
  };

  // ─── Feature flags ─────────────────────────────────────────────────────────

  const isPersonalHubEnabled = features.personal_hub === true;

  return (
    <PersonalHubContext.Provider
      value={{
        features,
        isPersonalHubEnabled,
        habits,
        goals,
        vocabulary,
        fitness,
        journals,
        loading,
        error,
        createHabit,
        updateHabit,
        deleteHabit,
        toggleHabit,
        createGoal,
        updateGoal,
        deleteGoal,
        createVocabulary,
        reviewVocabulary,
        deleteVocabulary,
        updateFitnessPr,
        logWorkout,
        createJournal,
        updateJournal,
        refresh: fetchAll,
      }}
    >
      {children}
    </PersonalHubContext.Provider>
  );
};
