const path = require('path');

function buildReconcilerPath(relativePath) {
    return path.join('@gitpkg/react-conciler/src/', relativePath);
}

jest.mock(buildReconcilerPath('./ReactFiberConfig'), ()=>({
    supportsResources: false,
    supportsSingletons: false,
    isHostHoistableType: false,
    isHostSingletonType: false,
}));


jest.mock('shared/ReactFeatureFlags', ()=>({
  enableProfilerTimer: false,
  enableScopeAPI: false,
  enableLegacyHidden: false,
  enableTransitionTracing: false,
  enableDO_NOT_USE_disableStrictPassiveEffect: false,
  enableRenderableContext: false,
  disableLegacyMode: false,
  enableObjectFiber: false,
  enableViewTransition: false,
  enableSuspenseyImages: false,
  enableCreateEventHandleAPI: false,
  enableUseEffectEventHook: false,
}));


// jest.mock(buildReconcilerPath('./ReactFiberFlags'), ()=>({
//     NoFlags: false,
//     Placement: false,
//     StaticMask: false,
// }));


// jest.mock(buildReconcilerPath('./ReactRootTags'), ()=>({
//     ConcurrentRoot: 0,
// }));


