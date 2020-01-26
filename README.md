# mobx-store-provider

Use React Hooks with mobx-state-tree.

## Install

```bash
# via NPM
npm install mobx-store-provider --save
```

```bash
# via Yarn
yarn add mobx-store-provider
```

## Intro

Using Hooks with mobx-state-tree requires a bit of glue logic, this library provides that.

mobx-store-provide supplies utilities for creating and supplying your React components with a mobx-state-tree store, so they can bind to and trigger actions on it.

```javascript
// app.js
import React from "react";
import { types } from "mobx-state-tree";

import StoreProvider, { createStore } from "mobx-store-provider";
const { Provider } = StoreProvider("app");

import MyNameDisplay from "./MyNameDisplay";
const AppStore = types.model({
  name: types.string,
});

export default () => {
  const appStore = createStore(() => AppStore.create({ name: "Jonathan" }));
  return (
    <Provider value={appStore}>
      <MyNameDisplay />
    </Provider>
  );
};
```

```javascript
// MyNameDisplay.js
import React from "react";
import { observer } from "mobx-react";

import StoreProvider from "mobx-store-provider";
const { useStore } = StoreProvider("app");

export default observer(() => {
  const appStore = useStore();
  return <div>{appStore.name}</div>;
});
```

### API

- `StoreProvider(): IStoreProvider`

  Store provider factory. Use this to create a new `Provider` which you can use to supply a store to your application.

  - Returns an **IStoreProvider** instance

    This is the instance created and returned by the `StoreProvider`. It contains three properties:

    1. `<Provider value={yourStore} />` - This is the wrapper component you can use to provide your application with the store.

    1. `useStore(mapStateToProps: Function)` - This is the React Hook which you can use in your other components to retrieve and use the store.

       Typically you would export `useStore` from where you instantiated it, so that you can import and use it in other components.

       You can optionally pass it a `mapStateToProps` function which you can use to select and return specific slices of data into your components with. This would be analagous to redux selectors.

       ```javascript
       function selectName(store) {
         return store.person.name;
       }
       function selectJobTitle(store) {
         return store.person.job.title;
       }

       // Then in a component
       export default observer(() => {
         const { name, job } = useStore(function mapStateToProps(store) {
           return {
             name: selectName(store),
             job: selectJobTitle(store),
           };
         });
         return (
           <div>
             <div>Person Info</div>
             <div>Name: {name}</div>
             <div>Job: {job}</div>
           </div>
         );
       });
       ```

    1. `Consumer` - You can alternatively use this to consume the store in your components.

       ```javascript
       <Consumer>{appStore => <div>{appStore.name}</div>}</Consumer>
       ```

- `createStore(fn)`

  This is a React Hook which you use to instantiate new mobx-state-tree instances inside of components. You would typically use in your main `app.js`, and then use a `StoreProvider` to provide it to your application.

  It takes a `Function` as its input, you should instantiate and return your mobx-state-tree instance within that function.

  ```javascript
  const myStore = createStore(() => MyStore.create({ ... }));
  ```

## What problem does mobx-store-provider solve?

When using mobx-state-tree in an application, you have to somehow provide the store to your component.

With class-based components, you would use `inject` and/or `observer` to supply your components with their mobx-state-tree/store and to bind the render function to changes detected.

Here is a class-based example using `@inject` and `@observer` decorators:

```javascript
import React, { Component } from "react";
import { Provider } from "mobx-react";
import { types } from "mobx-state-tree";

// We import our child component from another module
import MyNameDisplay from "./MyNameDisplay";

// Our mobx-state-tree store definition
const AppStore = types.model({
  name: types.string,
});

// Main component which creates appStore, wraps our content in the provider and passes it as the store value.
export default class MyComponent extends Component {
  appStore = AppStore.create({ name: "Jonathan" });
  render() {
    return (
      <Provider store={this.appStore}>
        <MyNameDisplay />
      </Provider>
    );
  }
}
```

In another file, you have the `MyNameDisplay` component:

```javascript
import React, { Component } from "react";
import { inject, observer } from "mobx-react";

// Using inject, we get the store from the provider and use it in the render method.
@inject("store")
@observer
export default class MyNameDisplay extends Component {
  render() {
    return <div>{this.props.store.name}</div>;
  }
}
```

This works well enough, but has a few possible issues:

1. Requires the use of decorators for `@inject` and `@observer`.

   This may be a problem if you don't have control of or know how to add that capability to your bundler. As an example, if you started with a create-react-app base and haven't ejected - then you can't use decorators.

1. In lieu of decorators, it requires you to wrap your components with `inject()` and `observer()`.

   ```javascript
   import React from "react";
   import { inject, observer } from "mobx-react";

   const MyNameDisplay = inject("store")(observer(props => <div>{props.store.name}</div>));
   ```

   That is pretty ugly syntax, quite verbose, and I have to read it a bit to understand it.

   In reality, `inject()` in particular works best with a decorator on a class-based component. It isn't ideal for functional/hook-based components.

1. Using `inject()` is not idiomatic apropos to [React Hooks](https://reactjs.org/docs/hooks-reference.html) use (which may matter if you are transitioning to Hooks).

## The solution: Use mobx-store-provider

The same example from above, but using mobx-store-provider with hooks on functional components instead:

```javascript
import React from "react";
import { types } from "mobx-state-tree";
import StoreProvider, { createStore } from "mobx-store-provider";

// We import our child component from another module
import MyNameDisplay from "./MyNameDisplay";

// Our mobx-state-tree store definition
const AppStore = types.model({
  name: types.string,
});

// Create the provider and hook we can use in our application to access this store
const { Provider: AppStoreProvider, useStore: useAppStore } = StoreProvider();
// To provide this store to other components, we export useAppStore here and then import it elsewhere:
export { useAppStore };

// Now we use the hook createStore to create appStore, and then wrap our application with
// AppStoreProvider, passing in appStore for the value.
export default () => {
  const appStore = createStore(() => AppStore.create({ name: "Jonathan" }));
  return (
    <AppStoreProvider value={appStore}>
      <MyNameDisplay />
    </AppStoreProvider>
  );
};
```

In another file, you have the `MyNameDisplay` component:

```javascript
import React from "react";
import { observer } from "mobx-react";

// Instead of inject(), we import the useAppStore hook from where we created it.
import { useAppStore } from "path/to/module/above";

export default observer(() => {
  // Then we can use the hook to get and use the store in our component
  const appStore = useAppStore();
  return <div>{appStore.name}</div>;
});
```
