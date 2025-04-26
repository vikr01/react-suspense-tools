// const path = require("path");

// const reactReconcilerPath = path.dirname(require.resolve('@gitpkg/react-reconciler/package.json'));

// function buildReconcilerPath(relativePath) {
//   return path.join(reactReconcilerPath, "/src/", relativePath);
// }

// const builtpath = buildReconcilerPath("./ReactFiberConfig");

// console.log('builtpath', builtpath);

// jest.mock(builtpath, () => ({
//   supportsResources: 0,
//   supportsSingletons: false,
//   isHostHoistableType: false,
//   isHostSingletonType: false,
// }));

// jest.mock(
//   buildReconcilerPath('./ReactFiber'), 
//   ()=>jest.requireActual(
//     '@gitpkg/react-reconciler/src/ReactFiber'
//   )
// );

// __EXPERIMENTAL__ = false;
// __PROFILE__ = false;

// // jest.mock("shared/ReactFeatureFlags", () => ({
// //   enableProfilerTimer: false,
// //   enableScopeAPI: false,
// //   enableLegacyHidden: false,
// //   enableTransitionTracing: false,
// //   enableDO_NOT_USE_disableStrictPassiveEffect: false,
// //   enableRenderableContext: false,
// //   disableLegacyMode: false,
// //   enableObjectFiber: false,
// //   enableViewTransition: false,
// //   enableSuspenseyImages: false,
// //   enableCreateEventHandleAPI: false,
// //   enableUseEffectEventHook: false,
// // }));

// // jest.mock(buildReconcilerPath('./ReactFiberFlags'), ()=>({
// //     NoFlags: false,
// //     Placement: false,
// //     StaticMask: false,
// // }));

// // jest.mock(buildReconcilerPath('./ReactRootTags'), ()=>({
// //     ConcurrentRoot: 0,
// // }));
