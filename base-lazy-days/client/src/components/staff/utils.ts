import type { Staff } from '../../../../shared/types';
import { TreatmentNames } from '../treatments/types';

export function filterByTreatment(
  staff: Staff[],
  treatmentName: TreatmentNames,
): Staff[] {
  if (treatmentName === 'all') {
    return staff;
  }
  return staff.filter((person) =>
    person.treatmentNames
      .map((t) => t.toLowerCase())
      .includes(treatmentName.toLowerCase()),
  );
}
