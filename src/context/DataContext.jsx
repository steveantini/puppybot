import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import {
  fetchPuppy,
  savePuppy as storageSavePuppy,
  addWeightLog as storageAddWeightLog,
  fetchAllLogs,
  upsertDayLog,
  fetchHealthRecords,
  insertHealthRecord,
  deleteHealthRecordById,
  createEmptyDayLog,
} from '../utils/storage';
import { getTodayKey, generateId } from '../utils/helpers';
import { useAuth } from './AuthContext';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const userIdRef = useRef(null);

  const [puppy, setPuppy] = useState(null);
  const [todayLog, setTodayLog] = useState(createEmptyDayLog(getTodayKey()));
  const [allLogs, setAllLogs] = useState({});
  const [healthRecords, setHealthRecords] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Keep userId ref updated for callbacks
  useEffect(() => {
    userIdRef.current = user?.id || null;
  }, [user?.id]);

  // ─── Load data when user changes (login/logout) ───────────
  useEffect(() => {
    let cancelled = false;

    // Wait for auth to finish loading
    if (authLoading) return;

    // If no user, clear data and stop loading
    if (!user) {
      setPuppy(null);
      setAllLogs({});
      setTodayLog(createEmptyDayLog(getTodayKey()));
      setHealthRecords([]);
      setIsLoading(false);
      return;
    }

    const userId = user.id;

    async function load() {
      setIsLoading(true);
      try {
        console.log('[DataContext] Loading data for user:', userId);
        const [puppyData, logsData, healthData] = await Promise.all([
          fetchPuppy(userId),
          fetchAllLogs(userId),
          fetchHealthRecords(userId),
        ]);

        if (cancelled) return;

        console.log('[DataContext] Puppy:', puppyData?.name, 'Logs:', Object.keys(logsData).length, 'Health:', healthData.length);

        if (puppyData) setPuppy(puppyData);
        else setPuppy(null);

        setAllLogs(logsData);
        setHealthRecords(healthData);

        const todayKey = getTodayKey();
        setTodayLog(logsData[todayKey] || createEmptyDayLog(todayKey));
      } catch (err) {
        console.error('[DataContext] Failed to load data:', err);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [user?.id, authLoading]);

  // Refresh today's log when date changes (midnight rollover)
  useEffect(() => {
    const interval = setInterval(() => {
      const key = getTodayKey();
      if (todayLog.date !== key) {
        setTodayLog(allLogs[key] || createEmptyDayLog(key));
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [todayLog.date, allLogs]);

  // ─── Puppy ───────────────────────────────────────────────

  const updatePuppy = useCallback(async (data) => {
    const updated = { ...puppy, ...data };
    setPuppy(updated);
    try {
      const id = await storageSavePuppy(updated, userIdRef.current);
      if (!updated.id && id) {
        setPuppy((prev) => ({ ...prev, id }));
      }
    } catch (err) {
      console.error('Failed to save puppy:', err);
    }
  }, [puppy]);

  const addWeightEntry = useCallback(async (entry) => {
    const tempId = generateId();
    const tempEntry = { ...entry, id: tempId };
    setPuppy((prev) => ({
      ...prev,
      weightLog: [...(prev?.weightLog || []), tempEntry],
    }));
    try {
      if (puppy?.id) {
        const saved = await storageAddWeightLog(puppy.id, entry, userIdRef.current);
        setPuppy((prev) => ({
          ...prev,
          weightLog: prev.weightLog.map((w) => (w.id === tempId ? saved : w)),
        }));
      }
    } catch (err) {
      console.error('Failed to save weight entry:', err);
    }
  }, [puppy]);

  // ─── Day logs ────────────────────────────────────────────

  const updateDayLog = useCallback((date, updater) => {
    setAllLogs((prevLogs) => {
      const currentLog = prevLogs[date] || createEmptyDayLog(date);
      const updated =
        typeof updater === 'function'
          ? updater(currentLog)
          : { ...currentLog, ...updater };

      // Persist to Supabase (fire-and-forget with error logging)
      upsertDayLog(date, updated, userIdRef.current).catch((err) =>
        console.error('Failed to save day log:', err)
      );

      if (date === getTodayKey()) {
        setTodayLog(updated);
      }
      return { ...prevLogs, [date]: updated };
    });
  }, []);

  const updateTodayLog = useCallback(
    (updater) => {
      updateDayLog(getTodayKey(), updater);
    },
    [updateDayLog]
  );

  const addPottyBreak = useCallback(
    (entry, date) => {
      const targetDate = date || getTodayKey();
      updateDayLog(targetDate, (prev) => ({
        ...prev,
        pottyBreaks: [
          ...(prev.pottyBreaks || []),
          { ...entry, id: generateId() },
        ],
      }));
    },
    [updateDayLog]
  );

  const addMeal = useCallback(
    (entry, date) => {
      const targetDate = date || getTodayKey();
      updateDayLog(targetDate, (prev) => ({
        ...prev,
        meals: [...(prev.meals || []), { ...entry, id: generateId() }],
      }));
    },
    [updateDayLog]
  );

  const addNap = useCallback(
    (entry, date) => {
      const targetDate = date || getTodayKey();
      updateDayLog(targetDate, (prev) => ({
        ...prev,
        naps: [...(prev.naps || []), { ...entry, id: generateId() }],
      }));
    },
    [updateDayLog]
  );

  const setWakeUpTime = useCallback(
    (time, date) => {
      const targetDate = date || getTodayKey();
      updateDayLog(targetDate, (prev) => ({
        ...prev,
        wakeUpTimes: [
          ...(prev.wakeUpTimes || []),
          { id: generateId(), time },
        ],
      }));
    },
    [updateDayLog]
  );

  const setBedTime = useCallback(
    (time, date) => {
      const targetDate = date || getTodayKey();
      updateDayLog(targetDate, (prev) => ({
        ...prev,
        bedTime: time,
      }));
    },
    [updateDayLog]
  );

  const updateSkills = useCallback(
    (skills, date) => {
      const targetDate = date || getTodayKey();
      updateDayLog(targetDate, (prev) => ({ ...prev, skills }));
    },
    [updateDayLog]
  );

  const updateNotes = useCallback(
    (notes, date) => {
      const targetDate = date || getTodayKey();
      updateDayLog(targetDate, (prev) => ({ ...prev, notes }));
    },
    [updateDayLog]
  );

  const updateSnacks = useCallback(
    (snacks, date) => {
      const targetDate = date || getTodayKey();
      updateDayLog(targetDate, (prev) => ({ ...prev, snacks }));
    },
    [updateDayLog]
  );

  // ─── Health records ──────────────────────────────────────

  const addHealthRecord = useCallback(async (record) => {
    const tempId = generateId();
    const tempRecord = { ...record, id: tempId };
    setHealthRecords((prev) => [...prev, tempRecord]);
    try {
      const saved = await insertHealthRecord(record, userIdRef.current);
      setHealthRecords((prev) =>
        prev.map((r) => (r.id === tempId ? saved : r))
      );
    } catch (err) {
      console.error('Failed to save health record:', err);
    }
  }, []);

  const deleteHealthRecord = useCallback(async (id) => {
    setHealthRecords((prev) => prev.filter((r) => r.id !== id));
    try {
      await deleteHealthRecordById(id);
    } catch (err) {
      console.error('Failed to delete health record:', err);
    }
  }, []);

  // ─── Delete items from today's log ───────────────────────

  const deletePottyBreak = useCallback(
    (id) => {
      updateTodayLog((prev) => ({
        ...prev,
        pottyBreaks: prev.pottyBreaks.filter((p) => p.id !== id),
      }));
    },
    [updateTodayLog]
  );

  const deleteMeal = useCallback(
    (id) => {
      updateTodayLog((prev) => ({
        ...prev,
        meals: prev.meals.filter((m) => m.id !== id),
      }));
    },
    [updateTodayLog]
  );

  const deleteNap = useCallback(
    (id) => {
      updateTodayLog((prev) => ({
        ...prev,
        naps: prev.naps.filter((n) => n.id !== id),
      }));
    },
    [updateTodayLog]
  );

  const deleteWakeUpTime = useCallback(
    (id) => {
      updateTodayLog((prev) => ({
        ...prev,
        wakeUpTimes: prev.wakeUpTimes.filter((w) => w.id !== id),
      }));
    },
    [updateTodayLog]
  );

  const getDayLogByDate = useCallback(
    (date) => {
      return allLogs[date] || createEmptyDayLog(date);
    },
    [allLogs]
  );

  // ─── Context value ──────────────────────────────────────

  const value = {
    isLoading,
    puppy,
    updatePuppy,
    addWeightEntry,
    todayLog,
    updateTodayLog,
    updateDayLog,
    addPottyBreak,
    addMeal,
    addNap,
    setWakeUpTime,
    setBedTime,
    updateSkills,
    updateNotes,
    updateSnacks,
    deletePottyBreak,
    deleteMeal,
    deleteNap,
    deleteWakeUpTime,
    allLogs,
    getDayLogByDate,
    healthRecords,
    addHealthRecord,
    deleteHealthRecord,
  };

  return (
    <DataContext.Provider value={value}>{children}</DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}
