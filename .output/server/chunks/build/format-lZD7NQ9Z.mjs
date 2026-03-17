function formatDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function formatTime(date) {
  const d = date instanceof Date ? date : new Date(date);
  const hour = String(d.getHours()).padStart(2, "0");
  const minute = String(d.getMinutes()).padStart(2, "0");
  return `${hour}:${minute}`;
}
function formatDateTime(date) {
  const d = date instanceof Date ? date : new Date(date);
  return `${formatDate(d)} ${formatTime(d)}`;
}

export { formatDateTime as f };
//# sourceMappingURL=format-lZD7NQ9Z.mjs.map
