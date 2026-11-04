const SHARED_ODE_PATH = /^\/o\/([^/]+)$/;

export const getSharedOdeId = (pathname: string) =>
  SHARED_ODE_PATH.exec(pathname)?.[1];
