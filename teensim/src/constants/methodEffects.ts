export type MethodName = 'study' | 'sleep' | 'eat' | 'playGames' | 'talkToFriends';

export interface TeenagerState {
  energy: number;
  happiness: number;
  gpa: number;
  phoneBattery: number;
  isHungry: boolean;
}

export const DEFAULT_STATE: TeenagerState = {
  energy: 100,
  happiness: 80,
  gpa: 90.0,
  phoneBattery: 50,
  isHungry: false,
};

export const KNOWN_METHODS: MethodName[] = ['study', 'sleep', 'eat', 'playGames', 'talkToFriends'];

export function applyMethodEffect(state: TeenagerState, method: MethodName): TeenagerState {
  const s = { ...state };
  switch (method) {
    case 'study':
      s.energy = Math.max(0, s.energy - 15);
      s.gpa = Math.min(100, s.gpa + 2.0);
      break;
    case 'sleep':
      s.energy = 100;
      s.happiness = Math.min(100, s.happiness + 5);
      break;
    case 'eat':
      s.isHungry = false;
      s.energy = Math.min(100, s.energy + 20);
      break;
    case 'playGames':
      s.happiness = Math.min(100, s.happiness + 25);
      s.energy = Math.max(0, s.energy - 20);
      break;
    case 'talkToFriends':
      s.happiness = Math.min(100, s.happiness + 10);
      s.phoneBattery = Math.max(0, s.phoneBattery - 10);
      break;
  }
  return s;
}
