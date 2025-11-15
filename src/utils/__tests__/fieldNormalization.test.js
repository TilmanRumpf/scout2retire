import { describe, it, expect } from 'vitest';
import { normalizeFieldValue } from '../fieldNormalization.js';

describe('fieldNormalization', () => {
  describe('MODE: db (database storage)', () => {
    it('should convert comma-separated string to lowercase array for array fields', () => {
      const result = normalizeFieldValue(
        'water_bodies',
        'Atlantic Ocean, Mediterranean Sea',
        'db'
      );
      expect(result).toEqual(['atlantic ocean', 'mediterranean sea']);
    });

    it('should handle Postgres array literal', () => {
      const result = normalizeFieldValue(
        'geographic_features_actual',
        '{"Coastal","Mountain"}',
        'db'
      );
      expect(result).toEqual(['coastal', 'mountain']);
    });

    it('should clean and lowercase existing array', () => {
      const result = normalizeFieldValue(
        'vegetation_type_actual',
        ['Forest', '  Grassland  '],
        'db'
      );
      expect(result).toEqual(['forest', 'grassland']);
    });

    it('should return empty array for null/undefined array field', () => {
      expect(normalizeFieldValue('water_bodies', null, 'db')).toEqual([]);
      expect(normalizeFieldValue('water_bodies', undefined, 'db')).toEqual([]);
      expect(normalizeFieldValue('water_bodies', '', 'db')).toEqual([]);
    });

    it('should return non-array fields as-is', () => {
      expect(normalizeFieldValue('climate', 'Tropical', 'db')).toBe('Tropical');
      expect(normalizeFieldValue('population', 50000, 'db')).toBe(50000);
    });
  });

  describe('MODE: display (UI editing)', () => {
    it('should convert array to comma-separated string', () => {
      const result = normalizeFieldValue(null, ['coastal', 'mountain'], 'display');
      expect(result).toBe('coastal, mountain');
    });

    it('should convert Postgres literal to comma-separated string', () => {
      const result = normalizeFieldValue(null, '{"coastal","mountain"}', 'display');
      expect(result).toBe('coastal, mountain');
    });

    it('should return string as-is', () => {
      const result = normalizeFieldValue(null, 'tropical', 'display');
      expect(result).toBe('tropical');
    });

    it('should return empty string for null/undefined', () => {
      expect(normalizeFieldValue(null, null, 'display')).toBe('');
      expect(normalizeFieldValue(null, undefined, 'display')).toBe('');
    });
  });

  describe('MODE: compare (equality checks)', () => {
    it('should normalize array fields to lowercase sorted string', () => {
      const result1 = normalizeFieldValue('water_bodies', ['Ocean', 'Lake'], 'compare');
      const result2 = normalizeFieldValue('water_bodies', ['lake', 'ocean'], 'compare');

      expect(result1).toBe('lake, ocean'); // sorted
      expect(result2).toBe('lake, ocean');
      expect(result1).toBe(result2); // equal after normalization
    });

    it('should handle different input formats equivalently', () => {
      const array = normalizeFieldValue(
        'geographic_features_actual',
        ['Mountain', 'Coastal'],
        'compare'
      );
      const string = normalizeFieldValue(
        'geographic_features_actual',
        'Coastal, Mountain',
        'compare'
      );
      const postgres = normalizeFieldValue(
        'geographic_features_actual',
        '{"Mountain","Coastal"}',
        'compare'
      );

      expect(array).toBe('coastal, mountain');
      expect(string).toBe('coastal, mountain');
      expect(postgres).toBe('coastal, mountain');
    });

    it('should just trim non-array fields', () => {
      const result = normalizeFieldValue('climate', '  Tropical  ', 'compare');
      expect(result).toBe('Tropical'); // trimmed but case preserved
    });
  });

  describe('MODE: categorical (validation)', () => {
    it('should lowercase and trim', () => {
      const result = normalizeFieldValue(null, '  Tropical  ', 'categorical');
      expect(result).toBe('tropical');
    });

    it('should handle null/undefined', () => {
      expect(normalizeFieldValue(null, null, 'categorical')).toBe('');
      expect(normalizeFieldValue(null, undefined, 'categorical')).toBe('');
    });
  });

  describe('Edge cases', () => {
    it('should filter out empty array elements', () => {
      const result = normalizeFieldValue('water_bodies', 'ocean, , lake, ', 'db');
      expect(result).toEqual(['ocean', 'lake']);
    });

    it('should throw error for invalid mode', () => {
      expect(() => {
        normalizeFieldValue('climate', 'tropical', 'invalid');
      }).toThrow('Invalid normalization mode');
    });
  });

  describe('water_bodies bug regression test', () => {
    it('should compare "Atlantic Ocean" and "atlantic ocean" as equal', () => {
      const userInput = normalizeFieldValue(
        'water_bodies',
        'Atlantic Ocean',
        'compare'
      );
      const dbValue = normalizeFieldValue(
        'water_bodies',
        ['atlantic ocean'],
        'compare'
      );

      expect(userInput).toBe('atlantic ocean');
      expect(dbValue).toBe('atlantic ocean');
      expect(userInput).toBe(dbValue); // THIS WAS THE BUG
    });
  });
});
