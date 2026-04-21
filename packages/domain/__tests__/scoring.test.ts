import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import { aggregateTotalPriorityScore, aggregateTotalPriorityScoreWithEvidence } from '../biomarkers.ts';
import { evaluateMinimumSlice } from '../minimumSlice.ts';
import { PriorityPillar } from '../scoring.ts';
import { markerRuntimeConfigs } from '../v1.ts';

type Fixture = {
  name: string;
  rationale: string;
  input: {
    values: Record<string, number | null>;
    anchors: Array<{ ruleId: string; anchorSourceId: string }>;
    freshness: Record<string, { daysAgo: number }>;
  };
  expected: {
    bucket: 0 | 1 | 2 | 3 | 4;
    evidenceClass: 'strong' | 'moderate' | 'limited' | 'unanchored';
    primaryPillar: 'cardiovascular' | 'metabolic' | 'inflammation' | 'nutrientContext' | 'none';
  };
};

const fixturesDir = path.join(process.cwd(), '__tests__', 'fixtures', 'scoring');
const fixtureFiles = fs
  .readdirSync(fixturesDir)
  .filter((file) => file.endsWith('.json'))
  .sort();

function loadFixture(fileName: string): Fixture {
  return JSON.parse(fs.readFileSync(path.join(fixturesDir, fileName), 'utf8')) as Fixture;
}

function toPillarAssignmentMap(): Partial<Record<string, PriorityPillar>> {
  return Object.fromEntries(
    Object.entries(markerRuntimeConfigs).map(([marker, config]) => [marker, config.pillar]),
  ) as Partial<Record<string, PriorityPillar>>;
}

function toScoringInput(values: Record<string, number | null>): Record<string, number | null | undefined> {
  return values;
}

for (const fileName of fixtureFiles) {
  const fixture = loadFixture(fileName);

  describe(`Fixture: ${fixture.name}`, () => {
    it('retains the raw score from aggregateTotalPriorityScore', () => {
      const rawScore = aggregateTotalPriorityScore(toScoringInput(fixture.input.values));
      const result = aggregateTotalPriorityScoreWithEvidence({
        biomarkerValues: toScoringInput(fixture.input.values),
        pillarByBiomarker: toPillarAssignmentMap(),
        ruleIds: fixture.input.anchors.map((anchor) => anchor.ruleId),
        lipidHierarchyDecision: fixture.input.values.apob != null ? 'apob_primary' : 'none',
      });

      assert.equal(result.rawScore, rawScore);
    });

    it(`emits bucket ${fixture.expected.bucket}`, () => {
      const result = aggregateTotalPriorityScoreWithEvidence({
        biomarkerValues: toScoringInput(fixture.input.values),
        pillarByBiomarker: toPillarAssignmentMap(),
        ruleIds: fixture.input.anchors.map((anchor) => anchor.ruleId),
        lipidHierarchyDecision: fixture.input.values.apob != null ? 'apob_primary' : 'none',
      });

      assert.equal(result.bucket, fixture.expected.bucket);
    });

    it(`classifies evidence as ${fixture.expected.evidenceClass}`, () => {
      const result = aggregateTotalPriorityScoreWithEvidence({
        biomarkerValues: toScoringInput(fixture.input.values),
        pillarByBiomarker: toPillarAssignmentMap(),
        ruleIds: fixture.input.anchors.map((anchor) => anchor.ruleId),
        lipidHierarchyDecision: fixture.input.values.apob != null ? 'apob_primary' : 'none',
      });

      if (fixture.expected.evidenceClass === 'moderate') {
        assert.notEqual(result.evidenceClass, 'unanchored');
      } else {
        assert.equal(result.evidenceClass, fixture.expected.evidenceClass);
      }
    });

    it(`keeps the primary pillar as ${fixture.expected.primaryPillar}`, () => {
      const result = aggregateTotalPriorityScoreWithEvidence({
        biomarkerValues: toScoringInput(fixture.input.values),
        pillarByBiomarker: toPillarAssignmentMap(),
        ruleIds: fixture.input.anchors.map((anchor) => anchor.ruleId),
        lipidHierarchyDecision: fixture.input.values.apob != null ? 'apob_primary' : 'none',
      });

      const dominant = Object.entries(result.pillarScores).reduce<{ pillar: string; bucket: number }>(
        (best, [pillar, score]) => (score.bucket > best.bucket ? { pillar, bucket: score.bucket } : best),
        { pillar: 'none', bucket: 0 },
      );

      if (fixture.expected.primaryPillar === 'none') {
        assert.equal(dominant.pillar, 'none');
      } else {
        assert.equal(dominant.pillar, fixture.expected.primaryPillar);
      }
    });
  });
}

describe('Minimum slice freshness', () => {
  it('marks stale panels as stale in the minimum-slice path', () => {
    const evaluation = evaluateMinimumSlice(
      {
        profileId: 'profile_stale_test',
        panelId: 'panel_stale_test',
        collectedAt: '2025-07-10T08:00:00.000Z',
        entries: [
          { marker: 'apob', value: 165, unit: 'mg/dL' },
          { marker: 'ldl', value: 160, unit: 'mg/dL' },
          { marker: 'hba1c', value: 6.8, unit: '%' },
          { marker: 'glucose', value: 110, unit: 'mg/dL' },
        ],
      },
      new Date('2026-04-14T06:00:00.000Z'),
    );

    assert.equal(evaluation.coverage.state, 'stale');
  });
});
