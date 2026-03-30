import { describe, it, expect } from 'vitest';
import { applyMethodEffect, DEFAULT_STATE } from '../constants/methodEffects';

describe('applyMethodEffect', () => {
  it('study: decreases energy by 15, increases gpa by 2', () => {
    const result = applyMethodEffect({ ...DEFAULT_STATE }, 'study');
    expect(result.energy).toBe(85);
    expect(result.gpa).toBe(92);
  });

  it('sleep: restores energy to 100, increases happiness by 5', () => {
    const state = { ...DEFAULT_STATE, energy: 40, happiness: 70 };
    const result = applyMethodEffect(state, 'sleep');
    expect(result.energy).toBe(100);
    expect(result.happiness).toBe(75);
  });

  it('eat: sets isHungry to false, increases energy by 20', () => {
    const state = { ...DEFAULT_STATE, isHungry: true, energy: 60 };
    const result = applyMethodEffect(state, 'eat');
    expect(result.isHungry).toBe(false);
    expect(result.energy).toBe(80);
  });

  it('eat: energy does not exceed 100', () => {
    const result = applyMethodEffect({ ...DEFAULT_STATE }, 'eat');
    expect(result.energy).toBe(100);
  });

  it('playGames: increases happiness by 25, decreases energy by 20', () => {
    const result = applyMethodEffect({ ...DEFAULT_STATE }, 'playGames');
    expect(result.happiness).toBe(100);
    expect(result.energy).toBe(80);
  });

  it('talkToFriends: increases happiness by 10, decreases phoneBattery by 10', () => {
    const result = applyMethodEffect({ ...DEFAULT_STATE }, 'talkToFriends');
    expect(result.happiness).toBe(90);
    expect(result.phoneBattery).toBe(40);
  });

  it('energy clamps to 0 — never goes negative', () => {
    const state = { ...DEFAULT_STATE, energy: 10 };
    const result = applyMethodEffect(state, 'study');
    expect(result.energy).toBe(0);
  });

  it('happiness clamps to 100 — never exceeds', () => {
    const state = { ...DEFAULT_STATE, happiness: 99 };
    const result = applyMethodEffect(state, 'talkToFriends');
    expect(result.happiness).toBe(100);
  });

  it('phoneBattery clamps to 0 — never goes negative', () => {
    const state = { ...DEFAULT_STATE, phoneBattery: 5 };
    const result = applyMethodEffect(state, 'talkToFriends');
    expect(result.phoneBattery).toBe(0);
  });

  it('does not mutate the original state object', () => {
    const original = { ...DEFAULT_STATE };
    applyMethodEffect(original, 'study');
    expect(original.energy).toBe(DEFAULT_STATE.energy);
  });
});
