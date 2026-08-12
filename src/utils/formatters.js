// utils/formatters.js

export const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
