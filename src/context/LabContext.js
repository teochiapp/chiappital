import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiService from '../services/apiService';

const LabContext = createContext();

export const useLabData = () => {
  return useContext(LabContext);
};

export const LabProvider = ({ children }) => {
  const [sectorData, setSectorData] = useState({});
  const [countryData, setCountryData] = useState({});
  const [checklistHistory, setChecklistHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLabData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getLabPreferences();

      // Defensive parse: backend may return JSON as string in some MySQL configs
      const safeParse = (val, fallback) => {
        if (!val) return fallback;
        if (typeof val === 'string') { try { return JSON.parse(val); } catch { return fallback; } }
        return val;
      };

      setSectorData(safeParse(data.sectorAnalysis, {}));
      setCountryData(safeParse(data.countryAnalysis, {}));
      setChecklistHistory(safeParse(data.checklistHistory, []));
      setError(null);
    } catch (err) {
      console.error('Error fetching lab data:', err);
      // Fallback a localStorage si falla la DB o no hay conexión
      const s = localStorage.getItem('sectorAnalysis');
      const c = localStorage.getItem('countryAnalysis');
      const h = localStorage.getItem('checklistHistory');
      
      if (s) setSectorData(JSON.parse(s));
      if (c) setCountryData(JSON.parse(c));
      if (h) setChecklistHistory(JSON.parse(h));
      
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLabData();
  }, [fetchLabData]);

  const updateSectorData = async (newSectorData) => {
    setSectorData(newSectorData);
    try {
      await apiService.updateLabPreferences({ sectorAnalysis: newSectorData });
    } catch (err) {
      console.error('Error saving sector analysis:', err);
      throw err; // Re-throw so components can show error feedback
    }
  };

  const updateCountryData = async (newCountryData) => {
    setCountryData(newCountryData);
    try {
      await apiService.updateLabPreferences({ countryAnalysis: newCountryData });
    } catch (err) {
      console.error('Error saving country analysis:', err);
      throw err;
    }
  };

  const updateChecklistHistory = async (newHistory) => {
    setChecklistHistory(newHistory);
    try {
      await apiService.updateLabPreferences({ checklistHistory: newHistory });
    } catch (err) {
      console.error('Error saving checklist history:', err);
    }
  };

  return (
    <LabContext.Provider
      value={{
        sectorData,
        updateSectorData,
        countryData,
        updateCountryData,
        checklistHistory,
        updateChecklistHistory,
        loading,
        error,
        refreshLabData: fetchLabData
      }}
    >
      {children}
    </LabContext.Provider>
  );
};
