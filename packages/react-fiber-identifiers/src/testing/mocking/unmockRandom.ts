if (jest.isMockFunction(global.Math.random)) {
  console.log("restoring mock");
  (
    global.Math.random as unknown as jest.Mock<typeof Math.random>
  ).mockRestore?.();
}
