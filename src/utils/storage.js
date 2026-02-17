import { supabase } from './supabase';

// ─── Pure helpers (no DB) ────────────────────────────────────

export function createEmptyDayLog(date) {
  return {
    date,
    wakeUpTimes: [],
    bedTime: null,
    pottyBreaks: [],
    naps: [],
    meals: [],
    snacks: 0,
    skills: '',
    notes: '',
  };
}

// ─── PUPPY ───────────────────────────────────────────────────

export async function fetchPuppy(userId) {
  try {
    // Try with user_id filter first
    if (userId) {
      const { data: puppy, error } = await supabase
        .from('puppies')
        .select('*')
        .eq('user_id', userId)
        .limit(1)
        .maybeSingle();

      if (!error && puppy) {
        return await enrichPuppy(puppy);
      }
    }

    // Fallback: get any puppy (for backward compatibility / pre-migration data)
    const { data: puppy, error } = await supabase
      .from('puppies')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!puppy) return null;

    return await enrichPuppy(puppy);
  } catch (err) {
    console.error('fetchPuppy error:', err);
    return null;
  }
}

async function enrichPuppy(puppy) {
  const { data: weightLogs } = await supabase
    .from('weight_logs')
    .select('*')
    .eq('puppy_id', puppy.id)
    .order('date');

  return {
    id: puppy.id,
    name: puppy.name,
    breed: puppy.breed,
    birthday: puppy.birthday,
    breederName: puppy.breeder_name,
    breederWebsite: puppy.breeder_website,
    gotchaDay: puppy.gotcha_day,
    vetName: puppy.vet_name,
    vetWebsite: puppy.vet_website,
    microchipNumber: puppy.microchip_number,
    microchipCompany: puppy.microchip_company,
    insuranceCarrier: puppy.insurance_carrier,
    insurancePolicyNumber: puppy.insurance_policy_number,
    photoUrl: puppy.photo_url,
    weightLog: (weightLogs || []).map((w) => ({
      id: w.id,
      date: w.date,
      weight: Number(w.weight),
    })),
  };
}

export async function savePuppy(puppyData, userId) {
  const row = {
    name: puppyData.name || null,
    breed: puppyData.breed || null,
    birthday: puppyData.birthday || null,
    breeder_name: puppyData.breederName || null,
    breeder_website: puppyData.breederWebsite || null,
    gotcha_day: puppyData.gotchaDay || null,
    vet_name: puppyData.vetName || null,
    vet_website: puppyData.vetWebsite || null,
    microchip_number: puppyData.microchipNumber || null,
    microchip_company: puppyData.microchipCompany || null,
    insurance_carrier: puppyData.insuranceCarrier || null,
    insurance_policy_number: puppyData.insurancePolicyNumber || null,
    photo_url: puppyData.photoUrl || null,
  };

  if (puppyData.id) {
    const { error } = await supabase
      .from('puppies')
      .update(row)
      .eq('id', puppyData.id);
    if (error) throw error;
    return puppyData.id;
  } else {
    if (userId) row.user_id = userId;
    const { data, error } = await supabase
      .from('puppies')
      .insert(row)
      .select()
      .single();
    if (error) throw error;
    return data.id;
  }
}

export async function addWeightLog(puppyId, entry, userId) {
  const row = {
    puppy_id: puppyId,
    date: entry.date,
    weight: entry.weight,
  };
  if (userId) row.user_id = userId;

  const { data, error } = await supabase
    .from('weight_logs')
    .insert(row)
    .select()
    .single();
  if (error) throw error;
  return { id: data.id, date: data.date, weight: Number(data.weight) };
}

// ─── DAILY LOGS ──────────────────────────────────────────────

export async function fetchAllLogs(userId) {
  try {
    // Try with user_id filter first
    if (userId) {
      const { data, error } = await supabase
        .from('daily_logs')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (!error && data && data.length > 0) {
        return parseLogs(data);
      }
    }

    // Fallback: get all logs (backward compatibility)
    const { data, error } = await supabase
      .from('daily_logs')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return parseLogs(data);
  } catch (err) {
    console.error('fetchAllLogs error:', err);
    return {};
  }
}

function parseLogs(data) {
  const logs = {};
  (data || []).forEach((row) => {
    logs[row.date] = {
      date: row.date,
      wakeUpTimes: row.wake_up_times || [],
      bedTime: row.bed_time || null,
      pottyBreaks: row.potty_breaks || [],
      naps: row.naps || [],
      meals: row.meals || [],
      snacks: row.snacks || 0,
      skills: row.skills || '',
      notes: row.notes || '',
    };
  });
  return logs;
}

export async function upsertDayLog(date, dayLog, userId) {
  const row = {
    date,
    wake_up_times: dayLog.wakeUpTimes || [],
    bed_time: dayLog.bedTime || null,
    potty_breaks: dayLog.pottyBreaks || [],
    naps: dayLog.naps || [],
    meals: dayLog.meals || [],
    snacks: dayLog.snacks || 0,
    skills: dayLog.skills || '',
    notes: dayLog.notes || '',
    updated_at: new Date().toISOString(),
  };
  if (userId) row.user_id = userId;

  const { error } = await supabase.from('daily_logs').upsert(row, {
    onConflict: 'date',
  });
  if (error) throw error;
}

// ─── HEALTH RECORDS ──────────────────────────────────────────

export async function fetchHealthRecords(userId) {
  try {
    // Try with user_id filter first
    if (userId) {
      const { data, error } = await supabase
        .from('health_records')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (!error && data && data.length > 0) {
        return parseHealthRecords(data);
      }
    }

    // Fallback
    const { data, error } = await supabase
      .from('health_records')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    return parseHealthRecords(data);
  } catch (err) {
    console.error('fetchHealthRecords error:', err);
    return [];
  }
}

function parseHealthRecords(data) {
  return (data || []).map((r) => ({
    id: r.id,
    type: r.type,
    date: r.date,
    title: r.title,
    description: r.description || '',
    notes: r.notes || '',
  }));
}

export async function insertHealthRecord(record, userId) {
  const row = {
    type: record.type,
    date: record.date,
    title: record.title,
    description: record.description || '',
    notes: record.notes || '',
  };
  if (userId) row.user_id = userId;

  const { data, error } = await supabase
    .from('health_records')
    .insert(row)
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    type: data.type,
    date: data.date,
    title: data.title,
    description: data.description || '',
    notes: data.notes || '',
  };
}

export async function deleteHealthRecordById(id) {
  const { error } = await supabase
    .from('health_records')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
