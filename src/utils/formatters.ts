export function formatQuantity(val: number): string {
  if (val >= 1000 && Number.isInteger(val)) {
    return val.toLocaleString('it-IT');
  }
  return Number(val.toFixed(2)).toString();
}

export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch (e) {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    return d.toLocaleString('it-IT', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return dateString;
  }
}

export function getDaysUntilExpiration(dateString: string): number {
  if (!dateString) return 9999;
  const exp = new Date(dateString).getTime();
  const now = new Date().getTime();
  return Math.ceil((exp - now) / (1000 * 3600 * 24));
}
