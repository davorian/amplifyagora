import format from 'date-fns/format';

export const convertPoundsToPence = price => (price *100).toFixed(0);
export const convertPenceToPounds = price => (price /100).toFixed(2);
export const formatDateUKStyle = date => format(date, 'do MMM YYYY' );
export const formatDateUKStyleWithTime24H = date => format(date, 'HH:mm  do MMM YYYY' );
