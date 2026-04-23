const { withMainActivity } = require('@expo/config-plugins');

module.exports = function withDebug(config) {
  return withMainActivity(config, async (mod) => {
    console.log('--- MainActivity contents seen by debug plugin ---');
    console.log(mod.modResults.contents);
    console.log('------------------------------------------------');
    return mod;
  });
};
