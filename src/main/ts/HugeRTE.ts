import type { HugeRTE as HugeRTEGlobal } from 'hugerte';

const getHugeRTE = (view: Window): HugeRTEGlobal | null => {
  const global = view as any;

  return global && global.hugerte ? global.hugerte : null;
};

export { getHugeRTE };
