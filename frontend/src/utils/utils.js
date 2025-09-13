export function formatText(value) {
    if (!value) return "";
    const words = value.toLowerCase().split("_");
    if (words.length === 0) return "";
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
    return words.join(" ");
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