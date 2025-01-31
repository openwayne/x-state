const { message } = antd;
const middlewares = {
  before: [],
  after: [],
};

let __idx = 0;

export function useBefore(func) {
  // checl if func is a function
  if (typeof func !== "function") {
    throw new Error("Middleware must be a function");
  }
  middlewares.before.push({
    id: __idx++,
    func,
  });
}

// delete before and after middlewares
export function clearMiddlewares() {
  middlewares.before = [];
  middlewares.after = [];
}

export function clearMiddlewaresBefore() {
  middlewares.before = [];
}

export function clearMiddlewaresAfter() {
  middlewares.after = [];
}

export function clearMiddlewaresBeforeById(id) {
  middlewares.before = middlewares.before.filter(
    (middleware) => middleware.id !== id
  );
}

export function clearMiddlewaresAfterById(id) {
  middlewares.after = middlewares.after.filter(
    (middleware) => middleware.id !== id
  );
}

export function useAfter(func) {
  // checl if func is a function
  if (typeof func !== "function") {
    throw new Error("Middleware must be a function");
  }
  middlewares.after.push({ id: __idx++, func });
}

export async function request(url, options = {}) {
  let requestOptions = { ...options };
  let response;
  try {
    // Apply before middlewares
    for (const middleware of middlewares.before) {
      requestOptions = await middleware.func(requestOptions);
    }
    response = await fetch(url, requestOptions);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // avoid using response.json() because it will throw error
    let data = await response.text();

    // Apply after middlewares
    for (const middleware of middlewares.after) {
      data = await middleware.func(data);
    }

    return data;
  } catch (error) {
    console.error("Request failed:", error);
    message.error(error);
    throw error;
  }
}
