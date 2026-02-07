import React, { useMemo, useState } from 'react';
import { User } from '../types';
import { supabase } from '../supabase';

interface CompleteProfileProps {
  user: User;
  onComplete: () => void;
}

const CompleteProfile: React.FC<CompleteProfileProps> = ({ user, onComplete }) => {
  const [firstName, setFirstName] = useState(user.profile?.first_name || '');
  const [lastName, setLastName] = useState(user.profile?.last_name || '');
  const [dni, setDni] = useState(user.profile?.dni || '');
  const [birthDate, setBirthDate] = useState(user.profile?.birth_date || '');
  const [address, setAddress] = useState(user.profile?.address || '');
  const [city, setCity] = useState(user.profile?.city || '');
  const [phone, setPhone] = useState(user.profile?.phone || '');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSave = useMemo(() => {
    return (
      firstName.trim().length > 0 &&
      lastName.trim().length > 0 &&
      dni.trim().length > 0 &&
      String(birthDate || '').trim().length > 0 &&
      address.trim().length > 0 &&
      city.trim().length > 0
    );
  }, [firstName, lastName, dni, birthDate, address, city]);

  const handleSave = async () => {
    if (!canSave || saving) return;

    setSaving(true);
    setError(null);

    try {
      const payload: any = {
        id: user.id,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        dni: dni.trim(),
        birth_date: birthDate, // YYYY-MM-DD
        address: address.trim(),
        city: city.trim(),
        phone: phone.trim() ? phone.trim() : null
      };

      const { error: upErr } = await supabase.from('profiles').update(payload).eq('id', user.id);
      if (upErr) throw upErr;

      onComplete();
    } catch (e: any) {
      setError(e?.message || 'No se pudo guardar el perfil.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-14 px-6">
      <div className="card-surface p-10 rounded-[2.5rem] shadow-2xl border border-slate-800">
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
          Completar Perfil
        </h1>
        <p className="text-slate-400 mt-2 serif italic">
          Antes de entrar al Campus, necesitamos tus datos para que tu docente pueda identificarte.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Nombre *</label>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full bg-black/40 border border-slate-700 rounded-2xl px-5 py-4 text-white outline-none focus:border-sky-500"
              placeholder="Tu nombre"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Apellido *</label>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full bg-black/40 border border-slate-700 rounded-2xl px-5 py-4 text-white outline-none focus:border-sky-500"
              placeholder="Tu apellido"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">DNI *</label>
            <input
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              className="w-full bg-black/40 border border-slate-700 rounded-2xl px-5 py-4 text-white outline-none focus:border-sky-500"
              placeholder="Sin puntos"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Fecha de nacimiento *</label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              className="w-full bg-black/40 border border-slate-700 rounded-2xl px-5 py-4 text-white outline-none focus:border-sky-500"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Dirección *</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-black/40 border border-slate-700 rounded-2xl px-5 py-4 text-white outline-none focus:border-sky-500"
              placeholder="Calle y número"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Localidad *</label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full bg-black/40 border border-slate-700 rounded-2xl px-5 py-4 text-white outline-none focus:border-sky-500"
              placeholder="Ciudad / Localidad"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Teléfono (opcional)</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-black/40 border border-slate-700 rounded-2xl px-5 py-4 text-white outline-none focus:border-sky-500"
              placeholder="+54 9 ..."
            />
          </div>
        </div>

        {error && (
          <div className="mt-6 bg-rose-500/10 border border-rose-500/30 text-rose-200 p-4 rounded-2xl text-sm">
            {error}
          </div>
        )}

        <div className="mt-10 flex items-center justify-between gap-4">
          <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
            Campos obligatorios: *
          </div>

          <button
            onClick={handleSave}
            disabled={!canSave || saving}
            className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
              !canSave || saving
                ? 'bg-slate-800 text-slate-500 border-slate-700 cursor-not-allowed'
                : 'bg-white text-black border-white hover:bg-sky-400 hover:border-sky-400'
            }`}
          >
            {saving ? 'Guardando...' : 'Guardar y entrar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfile;
