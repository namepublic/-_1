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
    name: "Spicy restaurant",
    robot: {
      id: "fghij456",
      is_online: false,
    },
  },
  {
    id: 2,
    name: "Salt restaurant",
    robot: {
      id: "wrpoie",
      is_online: false,
    },
  },
  {
    id: 3,
    name: "Salt restaurant",
    robot: {
      id: "cbcvpok",
      is_online: true,
    },
  },
  {
    id: 4,
    name: "Pomegranate restaurant",
    robot: null
  },
  {
    id: 5,
    name: "Cherry restaurant",
    robot: null
  },
  {
    id: 6,
    name: "Melon restaurant",
    robot: null
  },
  {
    id: 7,
    name: "Melon restaurant",
    robot: {
      id: "mjhg11",
      is_online: true,
    },
  },
  {
    id: 8,
    name: "Grapes restaurant",
    robot: {
      id: "ij4aa56",
      is_online: true,
    },
  },
  {
    id: 9,
    name: "Pomegranate restaurant",
    robot: null
  },
  {
    id: 10,
    name: "Melon restaurant",
    robot: null
  },
];
