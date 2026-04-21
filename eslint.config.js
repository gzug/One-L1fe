module.exports = [
  {
    files: ['packages/domain/{biomarkers,minimumSlice,contracts}.ts'],
    rules: {
      // Keep wearable preference plumbing out of the scoring module set.
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: './userPreferences.ts',
              message: 'Wearable preferences must not be imported into the scoring module set.',
            },
            {
              name: './userPreferences',
              message: 'Wearable preferences must not be imported into the scoring module set.',
            },
          ],
        },
      ],
    },
  },
];
