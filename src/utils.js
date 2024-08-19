import React from 'react';

// Function to format numbers using the Internationalization API
export const formatNumber = (number) => new Intl.NumberFormat('en-US').format(number);

// Function to convert newlines to <br /> elements
export const convertNewlinesToBreaks = (text) => {
  if (!text) return null;
  return text.split('\n').map((line, index) => (
    <React.Fragment key={index}>
      {line}
      <br />
    </React.Fragment>
  ));
};

// Function to format dates in a more reliable way
export const formatDate = (dateString) => {
  // Split the dateString to avoid timezone issues in Safari
  const [year, month, day] = dateString.split('-');
  const date = new Date(Date.UTC(year, month - 1, day));

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const monthsOfYear = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const dayOfWeek = daysOfWeek[date.getUTCDay()];
  const monthName = monthsOfYear[date.getUTCMonth()];
  const dayOfMonth = date.getUTCDate();
  const yearNumber = date.getUTCFullYear();

  const daySuffix = (day) => {
    if (day > 3 && day < 21) return 'th';  // Handle special case for 11-13th
    switch (day % 10) {
      case 1: return "st";
      case 2: return "nd";
      case 3: return "rd";
      default: return "th";
    }
  };

  return `${dayOfWeek}, ${monthName} ${dayOfMonth}${daySuffix(dayOfMonth)}, ${yearNumber}`;
}

export function formatSaleTimesDate(dateString) {
  // Split the input date string by space to separate date and time
  let [datePart, timePart] = dateString.split(' ');

  // Split the date part by '-' to get the components of the date
  let [month, day, year] = datePart.split('-');

  // Format the year to be in two digits
  year = year.slice(2);

  // Combine the parts into the desired format
  let formattedDate = `${month}/${day}/${year} ${timePart}`;

  return formattedDate;
}

export function calculateDateDifference(date1, date2) {
  // Parse the date strings into Date objects
  let dateObj1 = new Date(date1.replace(/-/g, '/'));
  let dateObj2 = new Date(date2.replace(/-/g, '/'));

  // Calculate the difference in milliseconds
  let differenceInMillis = dateObj2 - dateObj1;

  // Convert the difference from milliseconds to days
  let differenceInDays = differenceInMillis / (1000 * 60 * 60 * 24);

  let daysText = "";
  if (differenceInDays > 1) {
    daysText = Math.floor(differenceInDays) + " days";
  } else if (differenceInDays == 1) {
    daysText = Math.floor(differenceInDays) + " day";
  } else {
    daysText = "0 days";
  }

  return daysText;
}

export const magicText = (itemID) => {
  let magicText = ""
  if (itemID.startsWith("500")) {
    magicText = "Magic "
  }
  return magicText
}

export const formatPriceDisplay = (originalPrice, price, sn_id, discount) => {
  const formatNumber = (number) => number.toLocaleString(); // Add your number formatting logic here if needed
  const originalPriceNum = Number(originalPrice);
  const priceNum = Number(price);
  const currency = sn_id.startsWith('870') ? ' Mesos' : ' NX';

  if (discount == 1) {
    const discountPercentage = Math.round(((originalPriceNum - priceNum) / originalPriceNum) * 100);
    return (
      <span>
        <span style={{ color: 'red' }}>{formatNumber(originalPriceNum)}{currency}</span>
        {' ➔ '}
        {formatNumber(priceNum)}{currency}
        {' ('}{discountPercentage}% off{')'}
      </span>
    );
  } else {
    return (
      <span>
        {formatNumber(priceNum)}{currency}
      </span>
    );
  }
};

export const worldNumbersToString = (worldNumbers) => {
  let worldText = "Sold in "

  if (worldNumbers == "0/1/17/18/30/45/46/70/48/49") {
    worldText += "Interactive and Heroic worlds"
  }
  
  else if (worldNumbers == "45/46/70") {
    worldText += "Heroic worlds only"
  }
  
  else {
    worldText += "Interactive worlds only"
  }

  return worldText;
};