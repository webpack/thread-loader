module.exports = function errorLoader() {
  // Intentionally throw to simulate a worker-thread failure
  throw new Error('Mock worker failed intentionally');
};
