const convertTime = (time) => {
  if (!time || typeof time !== "string" || !time.includes(":")) {
    return "N/A";
  }

  const timeParts = time.split(":");
  let hours = parseInt(timeParts[0], 10);
  const minutes = parseInt(timeParts[1], 10);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return "N/A";
  }

  let meridiem = "am";
  if (hours >= 12) {
    meridiem = "pm";
    if (hours > 12) {
      hours -= 12;
    }
  } else if (hours === 0) {
    hours = 12;
  }

  return (
    hours.toString().padStart(2, "0") +
    ":" +
    minutes.toString().padStart(2, "0") +
    " " +
    meridiem
  );
};

export default convertTime;
