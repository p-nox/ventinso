export function formatText(value) {
  if (!value) return "";

  const words = value.toLowerCase().split("_");

  const capitalized = words.map(word =>
    word.charAt(0).toUpperCase() + word.slice(1)
  );

  return capitalized.join(" ");
}


export function timeAgo(dateInput) {
  if (!dateInput) return "";

  const now = new Date();
  const date = new Date(dateInput);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} d ago`;

  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks} w ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} mo ago`;

  const years = Math.floor(days / 365);
  return `${years} y ago`;
}



export function getRelativeTime(date) {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
}


export function formatDateTime(isoString) {
    if (!isoString) return 'Pending';
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}`;
}

export function formatStatus(status) {
    return status
        .split('_')
        .map(word => word[0].toUpperCase() + word.slice(1))
        .join(' ');
}


export function getRatingPercentageAndLabel(avgOverallRating) {
    if (!avgOverallRating) return { percentage: 0, label: "" };

    const percentage = Math.round((avgOverallRating / 4) * 100); 
    let label = "";

    if (percentage > 75) label = "positive";
    else if (percentage > 50) label = "neutral";
    else if (percentage > 0) label = "poor";

    return { percentage, label };
}


export function formatMemberSince(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long"
  });
}


export function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "2-digit",
  });
}


export function formatTimestamp(timestamp) {
    if(!timestamp) return "";
    const date=new Date(timestamp);
    const day=date.getDate().toString().padStart(2,"0");
    const month=date.toLocaleString("en-GB",{month:"short"});
    const hour=date.getHours().toString().padStart(2,"0");
    const minute=date.getMinutes().toString().padStart(2,"0");
    return `${day} ${month} ${hour}:${minute}`;
}