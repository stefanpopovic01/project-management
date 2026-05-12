export const formatTimeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const secondsDiff = Math.round((date - now) / 1000);

  const units = [
    { label: 'year',   seconds: 31536000 },
    { label: 'month',  seconds: 2592000 },
    { label: 'day',    seconds: 86400 },
    { label: 'hour',   seconds: 3600 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 }
  ];

  for (const unit of units) {
    if (Math.abs(secondsDiff) >= unit.seconds || unit.label === 'second') {
      const value = Math.round(secondsDiff / unit.seconds);
      
      const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
      return rtf.format(value, unit.label);
    }
  }
};