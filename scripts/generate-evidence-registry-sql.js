const { buildEvidenceRegistryUpsertSql } = require('../dist/packages/domain/evidenceSupabaseSeed.js');

process.stdout.write(buildEvidenceRegistryUpsertSql());
