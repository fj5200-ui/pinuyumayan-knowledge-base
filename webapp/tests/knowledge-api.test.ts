import { describe, expect, it } from 'vitest';
import apiTests from '../../data/database/api_test_cases.json';

describe('knowledge API contract seed', () => {
  it('contains public, vocabulary, and guarded admin test groups', () => {
    const groups = apiTests.test_groups.map((group: any) => group.group);
    expect(groups).toContain('knowledge_public');
    expect(groups).toContain('puyuma_vocabulary');
    expect(groups).toContain('admin_guarded');
  });

  it('keeps admin procedures guarded by auth expectations', () => {
    const admin = apiTests.test_groups.find((group: any) => group.group === 'admin_guarded');
    expect(admin.cases.every((testCase: any) => testCase.expect.status === 401)).toBe(true);
  });
});

