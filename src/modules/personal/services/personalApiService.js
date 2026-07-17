// services/personalApiService.js — Llamadas al backend del Personal Hub
import config from '../../../config/environment';

const BASE_URL = `${config.API_URL}/api/personal`;

function getToken() {
  return localStorage.getItem('st_token');
}

function headers() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  };
}

async function request(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: headers(),
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) {
    const err = new Error(data?.error?.message || 'Error de red');
    err.status = res.status;
    throw err;
  }
  return data;
}

const personalApiService = {
  // Features
  getFeatures: () => request('GET', '/features'),
  updateFeature: (feature_name, enabled) => request('PUT', '/features', { feature_name, enabled }),

  // Habits
  getHabits: () => request('GET', '/habits'),
  createHabit: (habit) => request('POST', '/habits', habit),
  updateHabit: (id, habit) => request('PUT', `/habits/${id}`, habit),
  deleteHabit: (id) => request('DELETE', `/habits/${id}`),
  toggleHabit: (id) => request('POST', `/habits/${id}/toggle`),

  // Goals
  getGoals: () => request('GET', '/goals'),
  createGoal: (goal) => request('POST', '/goals', goal),
  updateGoal: (id, goal) => request('PUT', `/goals/${id}`, goal),
  deleteGoal: (id) => request('DELETE', `/goals/${id}`),

  // Vocabulary
  getVocabulary: () => request('GET', '/vocabulary'),
  createVocabulary: (wordData) => request('POST', '/vocabulary', wordData),
  reviewVocabulary: (id, quality) => request('PUT', `/vocabulary/${id}/review`, { quality }),
  deleteVocabulary: (id) => request('DELETE', `/vocabulary/${id}`),

  // Fitness
  getFitness: () => request('GET', '/fitness'),
  updateFitnessPr: (exercise, record_value) => request('PUT', '/fitness/pr', { exercise, record_value }),
  logWorkout: () => request('POST', '/fitness/workout'),

  // Journal
  getJournals: () => request('GET', '/journals'),
  createJournal: (journalData) => request('POST', '/journals', journalData),
  updateJournal: (id, journalData) => request('PUT', `/journals/${id}`, journalData),
};

export default personalApiService;
