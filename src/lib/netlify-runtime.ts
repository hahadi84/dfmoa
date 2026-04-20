type NetlifyRuntimeShape = {
  Netlify?: {
    env?: {
      get: (name: string) => string | undefined;
    };
    context?: {
      deploy?: {
        context?: string;
      };
    };
  };
};

function getNetlifyRuntime() {
  const candidate = globalThis as typeof globalThis & NetlifyRuntimeShape;

  if (candidate.Netlify) {
    return candidate;
  }

  try {
    const runtime = Function(
      "return typeof Netlify !== 'undefined' ? { Netlify } : globalThis"
    )() as NetlifyRuntimeShape;

    return runtime;
  } catch {
    return candidate;
  }
}

export function getNetlifyEnv(name: string) {
  return getNetlifyRuntime().Netlify?.env?.get(name);
}

export function getNetlifyDeployContext() {
  return getNetlifyRuntime().Netlify?.context?.deploy?.context;
}
