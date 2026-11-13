export const formateDate = (date, config) => {
  if (!date) return "N/A";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return typeof date === "string" ? date : "N/A";
  }
  const defaultOptions = { day: "numeric", month: "long", year: "numeric" };
  const options = config ? config : defaultOptions;

  return parsed.toLocaleDateString("en-US", options);
};
