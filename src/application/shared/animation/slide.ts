import { animate, style, transition, trigger } from '@angular/animations';

export const slide = trigger('slide', [
  transition(':enter', [
    style({ transform: 'translateX({{ moveX }})' }),
    animate('500ms', style({ transform: 'translateX(0px)' }))
  ]),
  transition(':leave', [
    style({ transform: 'translateX(0px)' }),
    animate('500ms', style({ transform: 'translateX({{ moveX}})' }))
  ])
]);


// export function slide(timings = '200ms ease') {
//   return trigger('slide', [
//     transition(':enter', [
//       style({height: 0, opacity: 0, overflow: 'hidden'}),
//       animate(timings, style({height: '*', opacity: 1})),
//     ]),
//     transition(':leave', [
//       style({overflow: 'hidden'}),
//       animate(timings, style({height: 0, opacity: 0})),
//     ]),
//   ]);
// }

// https://github.com/angular/angular/issues/19866
// https://ultimatecourses.com/blog/angular-animations-how-to-animate-lists
