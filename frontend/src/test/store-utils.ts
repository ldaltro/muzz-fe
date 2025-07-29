import { act } from "@testing-library/react";
import { storeResetFns } from "./setup";

export const createMockStore = <T extends object>(initialState: T, createFn: any) => {
  let state = { ...initialState };
  const listeners = new Set<() => void>();

  const setState = (partial: Partial<T> | ((state: T) => Partial<T>)) => {
    const nextState = typeof partial === "function" ? partial(state) : partial;
    state = { ...state, ...nextState };
    listeners.forEach((listener) => listener());
  };

  const getState = () => state;

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  const destroy = () => {
    listeners.clear();
  };

  const reset = () => {
    state = { ...initialState };
    listeners.forEach((listener) => listener());
  };

  storeResetFns.add(reset);

  const store = {
    setState,
    getState,
    subscribe,
    destroy,
  };

  return createFn(setState, getState, store);
};

export const waitForStoreUpdate = async (callback: () => void) => {
  await act(async () => {
    callback();
  });
};

export const getStoreSnapshot = <T>(store: { getState: () => T }) => {
  return store.getState();
};