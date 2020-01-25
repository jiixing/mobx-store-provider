import React, { useContext } from "react";

function identity(thing: any): any {
  return thing;
}

export interface MobxStoreProvider {
  Provider: any;
  Consumer: any;
  useStore: Function;
}

/**
 * Create a new StoreProvider instance, which supplies you with a `Provider`, `Consumer`, and a `useStore` hook.
 * @param defaultValue The default value you want supplied to consumers of useStore in the event no Provider is found (null by default)
 */
export default function StoreProvider(defaultValue = null): MobxStoreProvider {
  const StoreContext = React.createContext(defaultValue);
  return {
    Provider: StoreContext.Provider,
    Consumer: StoreContext.Consumer,
    useStore: (mapStateToProps: Function = identity): any => {
      const store = useContext(StoreContext);
      return mapStateToProps(store);
    },
  };
}
