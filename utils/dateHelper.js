exports.getDate = (timezone) => {
  return (nDate = new Date().toLocaleString("en-US", {
    timeZone: "" + timezone + "",
  }));
};

exports.getDateFromString = (str, timezone) => {
  return (nDate = new Date(str).toLocaleString("en-US", {
    timeZone: "" + timezone + "",
  }));
};

exports.timeStampToDate = (timestamp, timezone) => {
  return (nDate = new Date(timestamp * 1000).toLocaleString("en-US", {
    timeZone: "" + timezone + "",
  }));
};

exports.toTimeStamp = (strDate) => {
  var datum = Date.parse(strDate);
  return datum / 1000;
};

exports.convertTime12to24 = (time12h) => {
  const [time, modifier] = time12h.split(" ");

  let [hours, minutes] = time.split(":");

  if (hours === "12") {
    hours = "00";
  }

  if (modifier === "PM") {
    hours = parseInt(hours, 10) + 12;
  }

  return `${hours}:${minutes}`;
};

exports.makeDate = (scheduleDate, day, time) => {
  //finding correct date according to day and schedule date
  let increment = 0;
  let milliSecsInADay = 86400000;
  switch (day) {
    case "monday":
      increment += 0;
      break;
    case "tuesday":
      increment += milliSecsInADay;

      break;
    case "wednesday":
      increment += 2 * milliSecsInADay;
      break;
    case "thursday":
      increment += 3 * milliSecsInADay;
      break;
    case "friday":
      increment += 4 * milliSecsInADay;
      break;
    case "saturday":
      increment += 5 * milliSecsInADay;
      break;
    case "sunday":
      increment += 6 * milliSecsInADay;
      break;
    default:
      increment += 0;
  }

  let thisDate = new Date(new Date(scheduleDate).getTime() + increment);

  // converting am/pm to 24 hours format
  let thisTime = this.convertTime12to24(time);
  // returning a string in date format.
  return `${thisDate.toISOString().split("T")[0]} ${thisTime}:00.000Z`;
};

exports.timeZones = [
  { value: "Pacific/Midway", text: "(GMT-11:00) Midway Island, Samoa" },
  { value: "America/Adak", text: "(GMT-10:00) Hawaii-Aleutian" },
  { value: "Etc/GMT+10", text: "(GMT-10:00) Hawaii" },
  { value: "Pacific/Marquesas", text: "(GMT-09:30) Marquesas Islands" },
  { value: "Pacific/Gambier", text: "(GMT-09:00) Gambier Islands" },
  { value: "America/Anchorage", text: "(GMT-09:00) Alaska" },
  { value: "America/Ensenada", text: "(GMT-08:00) Tijuana, Baja California" },
  { value: "Etc/GMT+8", text: "(GMT-08:00) Pitcairn Islands" },
  {
    value: "America/Los_Angeles",
    text: "(GMT-08:00) Pacific Time (US & Canada)",
  },
  {
    value: "America/Denver",
    text: "(GMT-07:00) Mountain Time (US & Canada)",
  },
  {
    value: "America/Chihuahua",
    text: "(GMT-07:00) Chihuahua, La Paz, Mazatlan",
  },
  { value: "America/Dawson_Creek", text: "(GMT-07:00) Arizona" },
  {
    value: "America/Belize",
    text: "(GMT-06:00) Saskatchewan, Central America",
  },
  {
    value: "America/Cancun",
    text: "(GMT-06:00) Guadalajara, Mexico City, Monterrey",
  },
  { value: "Chile/EasterIsland", text: "(GMT-06:00) Easter Island" },
  {
    value: "America/Chicago",
    text: "(GMT-06:00) Central Time (US & Canada)",
  },
  {
    value: "America/New_York",
    text: "(GMT-05:00) Eastern Time (US & Canada)",
  },
  { value: "America/Havana", text: "(GMT-05:00) Cuba" },
  {
    value: "America/Bogota",
    text: "(GMT-05:00) Bogota, Lima, Quito, Rio Branco",
  },
  { value: "America/Caracas", text: "(GMT-04:30) Caracas" },
  { value: "America/Santiago", text: "(GMT-04:00) Santiago" },
  { value: "America/La_Paz", text: "(GMT-04:00) La Paz" },
  { value: "Atlantic/Stanley", text: "(GMT-04:00) Faukland Islands" },
  { value: "America/Campo_Grande", text: "(GMT-04:00) Brazil" },
  {
    value: "America/Goose_Bay",
    text: "(GMT-04:00) Atlantic Time (Goose Bay)",
  },
  { value: "America/Glace_Bay", text: "(GMT-04:00) Atlantic Time (Canada)" },
  { value: "America/St_Johns", text: "(GMT-03:30) Newfoundland" },
  { value: "America/Araguaina", text: "(GMT-03:00) UTC-3" },
  { value: "America/Montevideo", text: "(GMT-03:00) Montevideo" },
  { value: "America/Miquelon", text: "(GMT-03:00) Miquelon, St. Pierre" },
  { value: "America/Godthab", text: "(GMT-03:00) Greenland" },
  {
    value: "America/Argentina/Buenos_Aires",
    text: "(GMT-03:00) Buenos Aires",
  },
  { value: "America/Sao_Paulo", text: "(GMT-03:00) Brasilia" },
  { value: "America/Noronha", text: "(GMT-02:00) Mid-Atlantic" },
  { value: "Atlantic/Cape_Verde", text: "(GMT-01:00) Cape Verde Is." },
  { value: "Atlantic/Azores", text: "(GMT-01:00) Azores" },
  { value: "Europe/Belfast", text: "(GMT) Greenwich Mean Time : Belfast" },
  { value: "Europe/Dublin", text: "(GMT) Greenwich Mean Time : Dublin" },
  { value: "Europe/Lisbon", text: "(GMT) Greenwich Mean Time : Lisbon" },
  { value: "Europe/London", text: "(GMT) Greenwich Mean Time : London" },
  { value: "Africa/Abidjan", text: "(GMT) Monrovia, Reykjavik" },
  {
    value: "Europe/Amsterdam",
    text: "(GMT+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna",
  },
  {
    value: "Europe/Belgrade",
    text: "(GMT+01:00) Belgrade, Bratislava, Budapest, Ljubljana, Prague",
  },
  {
    value: "Europe/Brussels",
    text: "(GMT+01:00) Brussels, Copenhagen, Madrid, Paris",
  },
  { value: "Africa/Algiers", text: "(GMT+01:00) West Central Africa" },
  { value: "Africa/Windhoek", text: "(GMT+01:00) Windhoek" },
  { value: "Asia/Beirut", text: "(GMT+02:00) Beirut" },
  { value: "Africa/Cairo", text: "(GMT+02:00) Cairo" },
  { value: "Asia/Gaza", text: "(GMT+02:00) Gaza" },
  { value: "Africa/Blantyre", text: "(GMT+02:00) Harare, Pretoria" },
  { value: "Asia/Jerusalem", text: "(GMT+02:00) Jerusalem" },
  { value: "Europe/Minsk", text: "(GMT+02:00) Minsk" },
  { value: "Asia/Damascus", text: "(GMT+02:00) Syria" },
  {
    value: "Europe/Moscow",
    text: "(GMT+03:00) Moscow, St. Petersburg, Volgograd",
  },
  { value: "Africa/Addis_Ababa", text: "(GMT+03:00) Nairobi" },
  { value: "Asia/Tehran", text: "(GMT+03:30) Tehran" },
  { value: "Asia/Dubai", text: "(GMT+04:00) Abu Dhabi, Muscat" },
  { value: "Asia/Yerevan", text: "(GMT+04:00) Yerevan" },
  { value: "Asia/Kabul", text: "(GMT+04:30) Kabul" },
  { value: "Asia/Yekaterinburg", text: "(GMT+05:00) Ekaterinburg" },
  { value: "Asia/Tashkent", text: "(GMT+05:00) Tashkent" },
  {
    value: "Asia/Kolkata",
    text: "(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi",
  },
  { value: "Asia/Katmandu", text: "(GMT+05:45) Kathmandu" },
  { value: "Asia/Dhaka", text: "(GMT+06:00) Astana, Dhaka" },
  { value: "Asia/Novosibirsk", text: "(GMT+06:00) Novosibirsk" },
  { value: "Asia/Rangoon", text: "(GMT+06:30) Yangon (Rangoon)" },
  { value: "Asia/Bangkok", text: "(GMT+07:00) Bangkok, Hanoi, Jakarta" },
  { value: "Asia/Krasnoyarsk", text: "(GMT+07:00) Krasnoyarsk" },
  {
    value: "Asia/Hong_Kong",
    text: "(GMT+08:00) Beijing, Chongqing, Hong Kong, Urumqi",
  },
  { value: "Asia/Irkutsk", text: "(GMT+08:00) Irkutsk, Ulaan Bataar" },
  { value: "Australia/Perth", text: "(GMT+08:00) Perth" },
  { value: "Australia/Eucla", text: "(GMT+08:45) Eucla" },
  { value: "Asia/Tokyo", text: "(GMT+09:00) Osaka, Sapporo, Tokyo" },
  { value: "Asia/Seoul", text: "(GMT+09:00) Seoul" },
  { value: "Asia/Yakutsk", text: "(GMT+09:00) Yakutsk" },
  { value: "Australia/Adelaide", text: "(GMT+09:30) Adelaide" },
  { value: "Australia/Darwin", text: "(GMT+09:30) Darwin" },
  { value: "Australia/Brisbane", text: "(GMT+10:00) Brisbane" },
  { value: "Australia/Hobart", text: "(GMT+10:00) Hobart" },
  { value: "Asia/Vladivostok", text: "(GMT+10:00) Vladivostok" },
  { value: "Australia/Lord_Howe", text: "(GMT+10:30) Lord Howe Island" },
  { value: "Etc/GMT-11", text: "(GMT+11:00) Solomon Is., New Caledonia" },
  { value: "Asia/Magadan", text: "(GMT+11:00) Magadan" },
  { value: "Pacific/Norfolk", text: "(GMT+11:30) Norfolk Island" },
  { value: "Asia/Anadyr", text: "(GMT+12:00) Anadyr, Kamchatka" },
  { value: "Pacific/Auckland", text: "(GMT+12:00) Auckland, Wellington" },
  { value: "Etc/GMT-12", text: "(GMT+12:00) Fiji, Kamchatka, Marshall Is." },
  { value: "Pacific/Chatham", text: "(GMT+12:45) Chatham Islands" },
  { value: "Pacific/Tongatapu", text: "(GMT+13:00) Nuku'alofa" },
  { value: "Pacific/Kiritimati", text: "(GMT+14:00) Kiritimati" },
];
