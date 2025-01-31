function createStateProxy(state) {
  return new Proxy(state, {
    set: () => {
      throw new Error("State is read-only");
    },
  });
}

export function createStore(initialState, actions) {
  let state = initialState;

  let stateProxy = new Proxy(state, {
    set: () => {
      throw new Error("State is read-only");
    },
  });
  const listeners = new Map();

  const getState = (key) => {
    if (!key) {
      return stateProxy;
    }
    const keys = key.split(".");
    let result = stateProxy;
    for (const k of keys) {
      if (stateProxy[k] === undefined) {
        return undefined;
      }
      result = stateProxy[k];
    }
    return result;
  };

  const setState = (newState) => {
    const tmpState =
      typeof newState === "function" ? newState(state) : newState;
    state = { ...state, ...tmpState };
    stateProxy = createStateProxy(state);

    listeners.forEach((scopes, listener) => {
      for (const scope of scopes) {
        if (!scope || newState.hasOwnProperty(scope)) {
          listener(stateProxy);
          break;
        }
      }
    });
  };

  const subscribe = (listener, scope) => {
    if (!listeners.has(listener)) {
      listeners.set(listener, new Set());
    }
    listeners.get(listener).add(scope);
    return () => {
      const scopes = listeners.get(listener);
      scopes.delete(scope);
      if (scopes.size === 0) {
        listeners.delete(listener);
      }
    };
  };

  const dispatch = async (action, ...args) => {
    if (actions[action]) {
      return await actions[action]({ getState, setState, dispatch }, ...args);
    } else {
      throw new Error(`Action ${action} is not defined`);
    }
  };

  return { getState, setState, subscribe, dispatch };
}
