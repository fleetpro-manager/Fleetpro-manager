import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { TRANSLATIONS } from '../constants.tsx';
import { MapPin, Clock, RefreshCw } from 'lucide-react';


interface PrayerTimeData {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

interface LocationData {
  city: string;
  country: string;
}

const IQAMAH_OFFSETS: Record<string, number> = {
  Fajr: 20,
  Dhuhr: 15,
  Asr: 15,
  Maghrib: 7,
  Isha: 15,
};

const PrayerTimesSection: React.FC = () => {
  const { language, prayerTimeOffsets } = useStore();
  const t = TRANSLATIONS[language];
  
  const [loading, setLoading] = useState(true);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimeData | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);

  const fetchPrayerTimes = async (lat: number, lng: number) => {
    try {
      const locRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`);
      const locData = await locRes.json();
      setLocation({
        city: locData.city || locData.locality || 'Unknown',
        country: locData.countryName || 'Unknown'
      });

      const date = new Date();
      const timestamp = Math.floor(date.getTime() / 1000);
      const prayerRes = await fetch(`https://api.aladhan.com/v1/timings/${timestamp}?latitude=${lat}&longitude=${lng}&method=2`);
      const prayerData = await prayerRes.json();
      
      if (prayerData.code === 200) {
        setPrayerTimes(prayerData.data.timings);
      }
    } catch (err) {
      console.error('Error fetching prayer times:', err);
    } finally {
      setLoading(false);
    }
  };

  const detectLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => fetchPrayerTimes(position.coords.latitude, position.coords.longitude),
        () => setLoading(false)
      );
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    detectLocation();
  }, []);

  const formatTime = (time24: string, prayerId: string) => {
    const offset = prayerTimeOffsets[prayerId] || 0;
    const [hours, minutes] = time24.split(':');
    const date = new Date();
    date.setHours(parseInt(hours));
    date.setMinutes(parseInt(minutes) + offset);
    let h = date.getHours();
    const m = date.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    return `${h}:${m} ${ampm}`;
  };

  const getIqamahTime = (adhanTime: string, offset: number, prayerId: string) => {
    const adhanOffset = prayerTimeOffsets[prayerId] || 0;
    const [hours, minutes] = adhanTime.split(':');
    const date = new Date();
    date.setHours(parseInt(hours));
    date.setMinutes(parseInt(minutes) + adhanOffset + offset);
    let h = date.getHours();
    const m = date.getMinutes().toString().padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    h = h ? h : 12;
    return `${h}:${m} ${ampm}`;
  };

  const prayers = [
    { id: 'Fajr', label: t.FAJR, icon: '🌅' },
    { id: 'Dhuhr', label: t.DHUHR, icon: '☀️' },
    { id: 'Asr', label: t.ASR, icon: '🌤️' },
    { id: 'Maghrib', label: t.MAGHRIB, icon: '🌇' },
    { id: 'Isha', label: t.ISHA, icon: '🌙' },
  ];

  if (loading && !prayerTimes) {
    return (
      <div className="bg-white/5 rounded-lg p-4 border border-white/10 animate-pulse">
        <div className="h-4 w-32 bg-white/10 rounded mb-4"></div>
        <div className="flex gap-3 overflow-hidden">
          {[1, 2, 3].map(i => <div key={i} className="min-w-[100px] h-24 bg-white/10 rounded-lg"></div>)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2 text-white/70">
          <MapPin size={14} className="text-cyan-400" />
          <span className="text-[10px] font-bold uppercase tracking-wider">
            {location ? `${location.city}, ${location.country}` : t.DETECTING_LOCATION}
          </span>
        </div>
        <button onClick={detectLocation} className="text-white/40 hover:text-white transition-colors">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      <div className="space-y-2">
        {prayers.map((prayer) => {
          const time = prayerTimes ? (prayerTimes as any)[prayer.id] : '--:--';
          const offset = IQAMAH_OFFSETS[prayer.id];
          const iqamah = prayerTimes ? getIqamahTime(time, offset, prayer.id) : '--:--';

          return (
            <div
              key={prayer.id}
              
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-3 shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{prayer.icon}</span>
                <div>
                  <span className="block text-[8px] font-black text-white/50 uppercase tracking-widest">{prayer.label}</span>
                  <span className="text-sm font-black text-white">{prayerTimes ? formatTime(time, prayer.id) : '--:--'}</span>
                </div>
              </div>
              
              <div className="text-right">
                <div className="flex items-center justify-end gap-1 text-[7px] text-cyan-400 font-bold uppercase">
                  <Clock size={8} />
                  {t.IQAMAH}
                </div>
                <span className="block text-[10px] font-bold text-white/90">{prayerTimes ? iqamah : '--:--'}</span>
                <span className="block text-[6px] text-white/30">{offset} {t.MINUTES_AFTER_ADHAN}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PrayerTimesSection;
