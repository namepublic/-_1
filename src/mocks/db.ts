export interface Location {
  id: number;
  name: string;
  robot: null | {
    id: string;
    is_online: boolean;
  };
}

export const locations: Location[] = [
  {
    id: 0,
    name: "Spicy restaurant",
    robot: {
      id: "abcde123",
      is_online: true,
    },
  },
  {
    id: 1,
    name: "Salty restaurant",
    robot: {
      id: "fghij456",
      is_online: false,
    },
  },
  {
    id: 2,
    name: "Salty restaurant",
    robot: null
  },
  {
    id: 3,
    name: "Salty restaurant",
    robot: null
  },
  {
    id: 4,
    name: "Salty restaurant",
    robot: null
  },
  {
    id: 5,
    name: "Salty restaurant",
    robot: null
  },
  {
    id: 6,
    name: "Salty restaurant",
    robot: null
  },
  {
    id: 7,
    name: "Salty restaurant",
    robot: null
  },
  {
    id: 8,
    name: "Salty restaurant",
    robot: null
  },
  {
    id: 9,
    name: "Salty restaurant",
    robot: null
  },
  {
    id: 10,
    name: "Salty restaurant",
    robot: null
  },
];
