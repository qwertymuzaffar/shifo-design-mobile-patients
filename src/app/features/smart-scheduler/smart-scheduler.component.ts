import {Component} from '@angular/core';

import {FormsModule} from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';

interface Doctor {
  name: string;
}

interface Appointment {
  doctor: string;
  time: string;
  patient: string;
}
@Component({
  selector: 'app-smart-scheduler',
  imports: [FormsModule, TranslocoPipe],
  template: `
    <div class="p-4">
      <h2 class="text-2xl font-bold mb-4">{{ 'smartScheduler.title' | transloco }}</h2>

      <form (ngSubmit)="findSlot()" class="space-y-4">
        <div>
          <label class="font-medium">{{ 'smartScheduler.patientName' | transloco }}:</label>
          <input
            [(ngModel)]="patientName"
            name="patientName"
            class="w-full border rounded p-2 mt-1"
            required
          />
        </div>

        <div>
          <label class="font-medium">{{ 'smartScheduler.doctorSequence' | transloco }}:</label>
          @for (doc of allDoctors; track doc) {
            <div>
              <input
                type="checkbox"
                [(ngModel)]="selectedDoctorsMap[doc.name]"
                name="doc_{{ doc.name }}"
              />
              <span class="ml-2">{{ doc.name }}</span>
            </div>
          }
        </div>

        <button
          type="submit"
          class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {{ 'smartScheduler.findSlot' | transloco }}
        </button>
      </form>

      @if (resultSlots && resultSlots.length) {
        <div class="mt-6">
          <h3 class="text-xl font-semibold mb-2">{{ 'smartScheduler.result' | transloco }}:</h3>
          <ul class="list-disc pl-6">
            @for (slot of resultSlots; track slot; let i = $index) {
              <li>
                {{ selectedDoctorList[i] }}: {{ slot }}
              </li>
            }
          </ul>
        </div>
      }

      @if (resultSlots === null) {
        <div class="mt-6 text-red-600">
          {{ 'smartScheduler.noSlot' | transloco }}
        </div>
      }
    </div>
  `,
  styles: []
})

export class SmartSchedulerComponent {
  patientName = '';

  allDoctors: Doctor[] = [
    { name: 'д-р Юнус' },
    { name: 'д-р Малика' },
    { name: 'д-р Саймиддин' },
  ];

  selectedDoctorsMap: { [key: string]: boolean } = {};

  timeSlots: string[] = [
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '12:00',
    '13:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
  ];

  appointments: Appointment[] = [
    { doctor: 'д-р Юнус', time: '09:00', patient: 'Саида Р.' },
    { doctor: 'д-р Юнус', time: '10:00', patient: 'Фируз А.' },
    { doctor: 'д-р Малика', time: '10:00', patient: 'Зухро С.' },
    { doctor: 'д-р Саймиддин', time: '14:00', patient: 'Хуршед Ю.' },
    { doctor: 'д-р Юнус', time: '15:00', patient: 'Иброхим И.' },
  ];

  resultSlots: string[] | null = [];
  selectedDoctorList: string[] = [];

  findSlot() {
    this.selectedDoctorList = Object.keys(this.selectedDoctorsMap).filter(
      (key) => this.selectedDoctorsMap[key],
    );
    const availability = this.buildAvailabilityMap();
    const result = this.findContinuousAvailableSequence(
      this.selectedDoctorList,
      this.timeSlots,
      availability,
    );
    this.resultSlots = result;
  }

  buildAvailabilityMap(): { [doctor: string]: { [time: string]: boolean } } {
    const map: { [doctor: string]: { [time: string]: boolean } } = {};
    for (const doctor of this.allDoctors) {
      map[doctor.name] = {};
      for (const time of this.timeSlots) {
        map[doctor.name][time] = false;
      }
    }
    for (const appoint of this.appointments) {
      map[appoint.doctor][appoint.time] = true;
    }
    return map;
  }

  findContinuousAvailableSequence(
    doctors: string[],
    timeSlots: string[],
    availability: { [doctor: string]: { [time: string]: boolean } },
  ): string[] | null {
    for (let i = 0; i <= timeSlots.length - doctors.length; i++) {
      let conflict = false;
      const candidate: string[] = [];

      for (let j = 0; j < doctors.length; j++) {
        const doctor = doctors[j];
        const time = timeSlots[i + j];

        if (availability[doctor][time]) {
          conflict = true;
          break;
        }

        const prevTime = timeSlots[i + j - 1];
        const nextTime = timeSlots[i + j + 1];

        if (j > 0 && availability[doctor][prevTime]) {
          conflict = true;
          break;
        }
        if (j < doctors.length - 1 && availability[doctor][nextTime]) {
          conflict = true;
          break;
        }

        candidate.push(time);
      }

      if (!conflict) {
        return candidate;
      }
    }
    return null;
  }
}
