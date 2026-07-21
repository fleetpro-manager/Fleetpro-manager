
export const getContrastColor = (hexColor: any) => {
  if (!hexColor || typeof hexColor !== 'string') return '#ffffff';
  
  if (hexColor.startsWith('rgb')) {
    const match = hexColor.match(/\d+/g);
    if (match && match.length >= 3) {
      const r = parseInt(match[0]);
      const g = parseInt(match[1]);
      const b = parseInt(match[2]);
      const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
      return (yiq >= 128) ? '#000000' : '#ffffff';
    }
    return '#ffffff';
  }

  let hex = hexColor;

  if (hexColor.startsWith('bg-')) {
    const colorMap: Record<string, string> = {
      'bg-yellow-400': '#facc15',
      'bg-teal-400': '#2dd4bf',
      'bg-red-400': '#f87171',
      'bg-orange-500': '#f97316',
      'bg-cyan-400': '#22d3ee',
      'bg-emerald-400': '#34d399',
      'bg-rose-400': '#fb7185',
      'bg-indigo-400': '#818cf8',
      'bg-lime-400': '#a3e635',
      'bg-amber-400': '#fbbf24',
      'bg-green-400': '#4ade80',
      'bg-gray-400': '#9ca3af',
      'bg-pink-400': '#f472b6',
      'bg-blue-400': '#60a5fa',
      'bg-purple-400': '#c084fc',
      'bg-fuchsia-400': '#e879f9',
      'bg-sky-400': '#38bdf8',
      'bg-violet-400': '#a78bfa',
      'bg-[var(--primary)]': '#000000',
      'bg-sky-500': '#0ea5e9',
      'bg-indigo-500': '#6366f1',
      'bg-red-500': '#ef4444',
      'bg-rose-500': '#f43f5e',
    };
    hex = colorMap[hexColor] || '#ffffff';
  }

  if (hex.includes('gradient')) {
    const match = hex.match(/#([0-9a-fA-F]{3,6})/);
    if (match) hex = match[0];
    else return '#ffffff';
  }
  hex = hex.replace('#', '');
  if (hex.length === 3) hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  if (hex.length !== 6) return '#ffffff';
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? '#000000' : '#ffffff';
};
