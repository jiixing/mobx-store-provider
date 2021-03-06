---
layout: default
title: Typescript
nav_order: 9
---

# Typescript

The biggest change to v2.x of **mobx-store-provider** is the addition of automatic type inferrence.

**What does that mean?**

In previous (pre 2.x) versions of **mobx-store-provider** you would have to explicitely define the interface for your stores/models in order to take advantage of typescript during development (type hinting, validation, etc). This is [the standard way it is handled in mobx-state-tree](https://mobx-state-tree.js.org/tips/typescript#using-a-mst-type-at-design-time) applications.

It also creates additional (unnecessary) technical debt. Dealing with these interfaces requires extra boilerplate, it is error prone, and in general it is simply a pain.

As of version 2.0 of **mobx-store-provider** your type definitions are correctly passed back automatically for you. To explain the change from 1.x to 2.x, please see the following examples:

## Old v1.x API

```javascript
import { types, Instance } from "mobx-state-tree";

// Define and the AppStore
export const AppStore = types.model({
  user: types.optional(types.string, ""),
});

// Because types are not inferred, we have to explicitly define the interface
interface IAppStore extends Instance<typeof AppStore> {}

// This is a component which uses the AppStore
function UserDisplay() {
  // With this verbose declaration, typescript knows the appStore is an AppStore
  const appStore: IAppStore = useStore();
  /**
   * The following will not compile, it will cause a typescript error
   * because `foobar` is not a property of an `AppStore`
   */
  return <div>{appStore.foobar}</div>;
}
```

As demonstrated above, you have to explicitly create the interface that describes the model you want typescript to handle correcly. This is cumbersome and error prone because you have to ensure to do this every place you use your model.

## New v2.x API

When using v2.x of **mobx-store-provider** and later, the typing is correctly inferred for you through the use of typescript generics and some minorish (but breaking) API changes/adjustments.

This can be seen in the following:

```javascript
import { types } from "mobx-state-tree";

// Define the AppStore
const AppStore = types.model({
  user: types.optional(types.string, ""),
});

// This is a component which uses the AppStore
function UserDisplay() {
  // With this declaration, mobx-store-provider correcly infers the type for AppStore
  const appStore = useStore(AppStore);
  /**
   * The following will not compile, it will cause a typescript error
   * because `foobar` is not a property of an `AppStore`
   */
  return <div>{appStore.foobar}</div>;
}
```

Note that in the v2.x example above, we do not have to explicitly define the interface for our model, this makes our code more concise and it also makes opting in for typescript definitions a no-effort ordeal. **mobx-store-provider** is able to correctly infer the typings for you automatically.

[Next: **Testing**](/testing){: .btn .btn-blue }
