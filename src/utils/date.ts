import dayjs from 'dayjs';
import 'dayjs/locale/fr';

dayjs.locale('fr');

export const formatDate = (date: string | number | Date | dayjs.Dayjs | null | undefined, format = 'DD MM YYYY') => {
  if (!date) return 'Date non spécifiée';
  return dayjs(date).format(format);
};
