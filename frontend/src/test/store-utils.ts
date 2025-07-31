import { act } from "@testing-library/react";

const storeResetFns = new Set<() => void>();

export { storeResetFns };

export const resetStore = <T extends object>(
  store: any,
  initialState: T
) => {
  const reset = () => {
    store.setState(initialState, true);
  };
  
  storeResetFns.add(reset);
  return reset;
};

export const waitForStoreUpdate = async (callback: () => void) => {
  await act(async () => {
    callback();
  });
};

export const getStoreSnapshot = <T>(store: { getState: () => T }) => {
  return store.getState();
};