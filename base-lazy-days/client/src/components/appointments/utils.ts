import dayjs from 'dayjs';

import type { Appointment, AppointmentDateMap } from '../../../../shared/types';
import { User } from '../../../../shared/types';

export function appointmentInPast(appointmentData: Appointment): boolean {
  const now = dayjs();
  return dayjs(appointmentData.dateTime) < now;
}

export function getAppointmentColor(
  appointmentData: Appointment,
  userId: number | undefined,
): [string, string] {
  const taken = !!appointmentData.userId;

  if (taken || appointmentInPast(appointmentData)) {
    const textColor = 'black';
    const bgColor = appointmentData.userId === userId ? 'white' : 'gray.300';
    return [textColor, bgColor];
  }
  const textColor = 'white';

  switch (appointmentData.treatmentName.toLowerCase()) {
    case 'massage':
      return [textColor, 'purple.700'];
    case 'scrub':
      return [textColor, 'blue.700'];
    case 'facial':
      return [textColor, 'green.700'];
    default:
      return [textColor, 'black'];
  }
}

export function getAvailableAppointments(
  appointments: AppointmentDateMap,
  user: User | null,
): AppointmentDateMap {
  //  clone the appointments object so we don't mutate the original
  const filteredAppointments = { ...appointments };
  // only keep appointments that are not taken or taken by the logged-in user and are in the future
  Object.keys(filteredAppointments).forEach((date) => {
    filteredAppointments[date] = filteredAppointments[date].filter(
      (appointment: Appointment) =>
        (!appointment.userId || appointment.userId === user?.id) &&
        !appointmentInPast(appointment),
    );
  });
  return filteredAppointments;
}
