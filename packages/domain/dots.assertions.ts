import {
  TAB_ORDER,
  dotCatalog,
  getChildDots,
  getDotDefinition,
  getDotsByTab,
  getLeafDots,
  getScoreInputLeaves,
} from './dots.ts';

function assert(condition: unknown, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

export function runDotCatalogAssertions(): void {
  assert(dotCatalog.length > 0, 'Dot catalog should not be empty.');

  // Every non-root dot must have a parent that exists in the catalog.
  for (const dot of dotCatalog) {
    if (dot.parentKey === null) {
      assert(dot.key === 'one_l1fe', 'Only one_l1fe may have a null parent.');
      continue;
    }
    const parent = dotCatalog.find((d) => d.key === dot.parentKey);
    assert(!!parent, `Dot ${dot.key} references unknown parent ${dot.parentKey}.`);
    assert(
      parent !== undefined && !parent.isLeaf,
      `Dot ${dot.key} has a leaf as parent (${dot.parentKey}).`,
    );
  }

  // No duplicate keys.
  const keys = dotCatalog.map((d) => d.key);
  assert(new Set(keys).size === keys.length, 'Dot catalog has duplicate keys.');

  // Every tabKey must be in TAB_ORDER.
  for (const dot of dotCatalog) {
    assert(
      TAB_ORDER.includes(dot.tabKey),
      `Dot ${dot.key} has unknown tabKey ${dot.tabKey}.`,
    );
  }

  // getDotDefinition round-trip.
  const blood = getDotDefinition('blood_biomarkers');
  assert(blood.title === 'Blood / Biomarkers', 'blood_biomarkers title mismatch.');
  assert(blood.baseWeight === 3.0, 'blood_biomarkers baseWeight should be 3.0.');
  assert(blood.tabKey === 'health_data', 'blood_biomarkers should live in health_data tab.');

  // Doctor Prep subtree must all be scoreContribution: 'output'.
  const doctorTree = dotCatalog.filter(
    (d) => d.key === 'doctor_prep' || d.parentKey === 'doctor_prep',
  );
  for (const dot of doctorTree) {
    assert(
      dot.scoreContribution === 'output',
      `Doctor Prep dot ${dot.key} must be scoreContribution: 'output'.`,
    );
  }

  // Symptoms must be scoreContribution: 'output'.
  const symptoms = getDotDefinition('symptoms');
  assert(symptoms.scoreContribution === 'output', 'symptoms must be output-only.');
  assert(symptoms.tabKey === 'lifestyle', 'symptoms should live in lifestyle tab.');

  // Mind & Sleep is a sub-group under Lifestyle, not a direct tab.
  const mindSleep = getDotDefinition('mind_and_sleep');
  assert(mindSleep.parentKey === 'lifestyle', 'mind_and_sleep must parent to lifestyle.');
  assert(mindSleep.isLeaf === false, 'mind_and_sleep must be a group, not a leaf.');
  assert(mindSleep.tabKey === 'lifestyle', 'mind_and_sleep tabKey must be lifestyle.');

  // planned_locked leaves should have baseWeight 0 — they contribute zero
  // even if their status were to flip by mistake at runtime.
  for (const dot of dotCatalog) {
    if (dot.defaultStatus === 'planned_locked') {
      assert(
        dot.baseWeight === 0,
        `planned_locked dot ${dot.key} should carry baseWeight 0.`,
      );
    }
  }

  // All 5 tabs must have at least one dot.
  for (const tab of TAB_ORDER) {
    const dots = getDotsByTab(tab);
    assert(dots.length > 0, `Tab ${tab} has no dots.`);
  }

  // Every leaf dot on an 'input' contribution that is not planned_locked
  // must carry baseWeight > 0 — otherwise it silently never contributes.
  for (const dot of getScoreInputLeaves()) {
    if (dot.defaultStatus === 'planned_locked') continue;
    assert(
      dot.baseWeight > 0,
      `Active input leaf ${dot.key} must have baseWeight > 0.`,
    );
  }

  // getChildDots basic behavior.
  const topLevel = getChildDots('one_l1fe');
  const topLevelKeys = topLevel.map((d) => d.key).sort();
  assert(
    JSON.stringify(topLevelKeys) ===
      JSON.stringify(['activity', 'doctor_prep', 'health_data', 'lifestyle']),
    'Top-level dots under one_l1fe must be the 4 group tabs (excluding one_l1fe itself).',
  );

  // Leaves are a strict subset.
  const leafCount = getLeafDots().length;
  assert(leafCount < dotCatalog.length, 'Leaves must be a strict subset of the catalog.');
  assert(leafCount > 0, 'Catalog must contain leaves.');
}
