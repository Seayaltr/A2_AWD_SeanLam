export function niceDate(iso: string) {
  return new Date(iso).toLocaleString('en-NZ', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}
