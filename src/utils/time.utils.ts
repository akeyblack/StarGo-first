import * as moment from 'moment';


export function addToTime(time: string, n: number): string {
  const dur = moment.duration(time, 'hours').add(n, 'hours');
  const hours = Math.floor(dur.asHours());
  const mins  = Math.floor(dur.asMinutes()) - hours * 60;
  return hours + ':' + ((mins>9) ? mins : '0' + mins);
}