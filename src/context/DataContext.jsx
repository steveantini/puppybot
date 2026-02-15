import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import {
  getPuppy,
  savePuppy as storageSavePuppy,
  getDayLog,
  saveDayLog as storageSaveDayLog,
  getAllLogs,
  getHealthRecords,
  saveHealthRecords as storageSaveHealthRecords,
  createEmptyDayLog,
} from '../utils/storage';
import { getTodayKey, generateId } from '../utils/helpers';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [puppy, setPuppy] = useState(() => getPuppy());
  const [todayLog, setTodayLog] = useState(() => getDayLog(getTodayKey()));
  const [allLogs, setAllLogs] = useState(() => getAllLogs());
  const [healthRecords, setHealthRecords] = useState(() => getHealthRecords());

  // Refresh today's log when date changes
  useEffect(() => {
    const interval = setInterval(() => {
      const key = getTodayKey();
      if (todayLog.date !== key) {
        setTodayLog(getDayLog(key));
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [todayLog.date]);

  const updatePuppy = useCallback((data) => {
    const updated = { ...puppy, ...data };
    storageSavePuppy(updated);
    setPuppy(updated);
  }, [puppy]);

  const addWeightEntry = useCallback((entry) => {
    const weightLog = [...(puppy?.weightLog || []), { ...entry, id: generateId() }];
    const updated = { ...puppy, weightLog };
    storageSavePuppy(updated);
    setPuppy(updated);
  }, [puppy]);

  const updateTodayLog = useCallback((updater) => {
    const key = getTodayKey();
    setTodayLog((prev) => {
      const updated = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      storageSaveDayLog(key, updated);
      setAllLogs((prevLogs) => ({ ...prevLogs, [key]: updated }));
      return updated;
    });
  }, []);

  const addPottyBreak = useCallback((entry) => {
    updateTodayLog((prev) => ({
      ...prev,
      pottyBreaks: [...prev.pottyBreaks, { ...entry, id: generateId() }],
    }));
  }, [updateTodayLog]);

  const addMeal = useCallback((entry) => {
    updateTodayLog((prev) => ({
      ...prev,
      meals: [...prev.meals, { ...entry, id: generateId() }],
    }));
  }, [updateTodayLog]);

  const addNap = useCallback((entry) => {
    updateTodayLog((prev) => ({
      ...prev,
      naps: [...prev.naps, { ...entry, id: generateId() }],
    }));
  }, [updateTodayLog]);

  const setWakeUpTime = useCallback((time) => {
    updateTodayLog((prev) => ({
      ...prev,
      wakeUpTimes: [...prev.wakeUpTimes, { id: generateId(), time }],
    }));
  }, [updateTodayLog]);

  const setBedTime = useCallback((time) => {
    updateTodayLog((prev) => ({
      ...prev,
      bedTime: time,
    }));
  }, [updateTodayLog]);

  const updateSkills = useCallback((skills) => {
    updateTodayLog((prev) => ({ ...prev, skills }));
  }, [updateTodayLog]);

  const updateNotes = useCallback((notes) => {
    updateTodayLog((prev) => ({ ...prev, notes }));
  }, [updateTodayLog]);

  const addHealthRecord = useCallback((record) => {
    const updated = [...healthRecords, { ...record, id: generateId() }];
    storageSaveHealthRecords(updated);
    setHealthRecords(updated);
  }, [healthRecords]);

  const deleteHealthRecord = useCallback((id) => {
    const updated = healthRecords.filter((r) => r.id !== id);
    storageSaveHealthRecords(updated);
    setHealthRecords(updated);
  }, [healthRecords]);

  const deletePottyBreak = useCallback((id) => {
    updateTodayLog((prev) => ({
      ...prev,
      pottyBreaks: prev.pottyBreaks.filter((p) => p.id !== id),
    }));
  }, [updateTodayLog]);

  const deleteMeal = useCallback((id) => {
    updateTodayLog((prev) => ({
      ...prev,
      meals: prev.meals.filter((m) => m.id !== id),
    }));
  }, [updateTodayLog]);

  const deleteNap = useCallback((id) => {
    updateTodayLog((prev) => ({
      ...prev,
      naps: prev.naps.filter((n) => n.id !== id),
    }));
  }, [updateTodayLog]);

  const getDayLogByDate = useCallback((date) => {
    return allLogs[date] || createEmptyDayLog(date);
  }, [allLogs]);

  const value = {
    puppy,
    updatePuppy,
    addWeightEntry,
    todayLog,
    updateTodayLog,
    addPottyBreak,
    addMeal,
    addNap,
    setWakeUpTime,
    setBedTime,
    updateSkills,
    updateNotes,
    deletePottyBreak,
    deleteMeal,
    deleteNap,
    allLogs,
    getDayLogByDate,
    healthRecords,
    addHealthRecord,
    deleteHealthRecord,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}
