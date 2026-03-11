import { MaterialValue } from "./types";

export const bleeds = {
  sm: 3,
  default: 5, // md
  lg: 7,
  xl: 10,
};

export const materials: MaterialValue[] = [
  {
    value: "glossyCardboard",
    label: "مقوا گلاسه",
    thickness: 0.5,
    get offset() {
      return {
        inner: 2,
        outer: this.thickness,
      };
    },
  },
  {
    value: "artPaper",
    label: "کاغذ گلاسه",
    thickness: 0.2,
    get offset() {
      return {
        inner: 1.5,
        outer: this.thickness,
      };
    },
  },
  {
    value: "fFlute",
    label: "کارتن فلوت F",
    thickness: 1.2,
    get offset() {
      return {
        inner: 2,
        outer: this.thickness,
      };
    },
  },
  {
    value: "eFlute",
    label: "کارتن فلوت E",
    thickness: 2,
    get offset() {
      return {
        inner: 2,
        outer: this.thickness,
      };
    },
  },
  {
    value: "bFlute",
    label: "کارتن فلوت B",
    thickness: 3,
    get offset() {
      return {
        inner: 3,
        outer: this.thickness,
      };
    },
  },
  {
    value: "cFlute",
    label: "کارتن فلوت C",
    thickness: 4,
    get offset() {
      return {
        inner: 4,
        outer: this.thickness,
      };
    },
  },
  {
    value: "beFlute",
    label: "کارتن فلوت BE",
    thickness: 5,
    get offset() {
      return {
        inner: 4,
        outer: this.thickness,
      };
    },
  },
  {
    value: "bcFlute",
    label: "کارتن فلوت BC",
    thickness: 7,
    get offset() {
      return {
        inner: 4,
        outer: this.thickness,
      };
    },
  },
  {
    value: "abFlute",
    label: "کارتن فلوت AB",
    thickness: 7,
    get offset() {
      return {
        inner: 4,
        outer: this.thickness,
      };
    },
  },
];

// export const materials: Materials = {
//   "art-paper": {
//     value: "art-paper",
//     label: "کاغذ گلاسه",
//     thickness: 0.2,
//     get offset() {
//       return {
//         inner: 1.5,
//         outer: this.thickness,
//       };
//     },
//   },
//   "glossy-cardboard": {
//     value: "glossy-cardboard",
//     label: "مقوا گلاسه",
//     thickness: 0.5,
//     get offset() {
//       return {
//         inner: 2,
//         outer: this.thickness,
//       };
//     },
//   },
//   "f-flute": {
//     value: "f-flute",
//     label: "کارتن فلوت F",
//     thickness: 1.2,
//     get offset() {
//       return {
//         inner: 2,
//         outer: this.thickness,
//       };
//     },
//   },
//   "e-flute": {
//     value: "e-flute",
//     label: "کارتن فلوت E",
//     thickness: 2,
//     get offset() {
//       return {
//         inner: 2,
//         outer: this.thickness,
//       };
//     },
//   },
//   "b-flute": {
//     value: "b-flute",
//     label: "کارتن فلوت B",
//     thickness: 3,
//     get offset() {
//       return {
//         inner: 3,
//         outer: this.thickness,
//       };
//     },
//   },
//   "c-flute": {
//     value: "c-flute",
//     label: "کارتن فلوت C",
//     thickness: 4,
//     get offset() {
//       return {
//         inner: 4,
//         outer: this.thickness,
//       };
//     },
//   },
//   "be-flute": {
//     value: "be-flute",
//     label: "کارتن فلوت BE",
//     thickness: 5,
//     get offset() {
//       return {
//         inner: 4,
//         outer: this.thickness,
//       };
//     },
//   },
//   "bc-flute": {
//     value: "bc-flute",
//     label: "کارتن فلوت BC",
//     thickness: 7,
//     get offset() {
//       return {
//         inner: 4,
//         outer: this.thickness,
//       };
//     },
//   },
//   "ab-flute": {
//     value: "ab-flute",
//     label: "کارتن فلوت AB",
//     thickness: 7,
//     get offset() {
//       return {
//         inner: 4,
//         outer: this.thickness,
//       };
//     },
//   },
// };
