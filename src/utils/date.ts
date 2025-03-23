import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import { computed } from 'vue';


export const formattedDate = computed((date: string | number | Date | dayjs.Dayjs | null | undefined) => {
    return dayjs(date).format('D MMMM YYYY');
  });