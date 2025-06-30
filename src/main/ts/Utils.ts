/**
 * Official HugeRTE React component
 * Copyright (c) 2022 Ephox Corporation DBA Tiny Technologies, Inc.
 * Copyright (c) 2024 HugeRTE contributors
 * Licensed under the MIT license (https://github.com/hugerte/hugerte-react/blob/main/LICENSE.TXT)
 */
import { IEvents } from './Events';
import { IAllProps } from './components/Editor';
import type { Editor as HugeRTEEditor, EditorEvent } from 'hugerte';

// TODO: Use what possible from `@hugerte/framework-integration-shared`

export const isFunction = (x: unknown): x is Function => typeof x === 'function';

const isEventProp = (name: keyof IAllProps): name is keyof IEvents => {
  const what = name.startsWith('on')/*  && name !== 'onEditorChange' */;
  console.log('isEventProp', name, what);
  return what;
}

const eventAttrToEventName = <T extends string>(attrName: `on${T}`): T => attrName.substring(2) as T;

type PropLookup = <K extends keyof IAllProps>(key: K) => IAllProps[K] | undefined;

export const configHandlers2 = <H> (
  handlerLookup: PropLookup,
  on: (name: string, handler: H) => void,
  off: (name: string, handler: H) => void,
  adapter: <K extends keyof IEvents> (lookup: PropLookup, key: K) => H,
  prevProps: Partial<IAllProps>,
  props: Partial<IAllProps>,
  boundHandlers: Record<string, H>
): void => {
  const prevEventKeys = (Object.keys(prevProps) as unknown as (keyof IAllProps)[]).filter(isEventProp);
  const currEventKeys = (Object.keys(props) as unknown as (keyof IAllProps)[]).filter(isEventProp);

  const removedKeys = prevEventKeys.filter((key) => props[key] === undefined);
  const addedKeys = currEventKeys.filter((key) => prevProps[key] === undefined);

  removedKeys.forEach((key) => {
    // remove event handler
    const eventName = eventAttrToEventName(key);
    const wrappedHandler = boundHandlers[eventName];
    off(eventName, wrappedHandler);
    delete boundHandlers[eventName];
  });

  addedKeys.forEach((key) => {
    const wrappedHandler = adapter(handlerLookup, key);
    const eventName = eventAttrToEventName(key);
    boundHandlers[eventName] = wrappedHandler;
    on(eventName, wrappedHandler);
  });
};

export const configHandlers = (
  editor: HugeRTEEditor,
  prevProps: Partial<IAllProps>,
  props: Partial<IAllProps>,
  boundHandlers: Record<string, (event: EditorEvent<any>) => unknown>,
  lookup: PropLookup
): void =>
  configHandlers2(
    lookup,
    editor.on.bind(editor),
    editor.off.bind(editor),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    (handlerLookup, key) => (e) => handlerLookup(key)?.(e, editor),
    prevProps,
    props,
    boundHandlers
  );

export const isTextareaOrInput = (element: Element | null): element is (HTMLTextAreaElement | HTMLInputElement) =>
  element !== null && (element.tagName.toLowerCase() === 'textarea' || element.tagName.toLowerCase() === 'input');

const normalizePluginArray = (plugins?: string | string[]): string[] => {
  if (typeof plugins === 'undefined' || plugins === '') {
    return [];
  }

  return Array.isArray(plugins) ? plugins : plugins.split(' ');
};

// eslint-disable-next-line max-len
export const mergePlugins = (initPlugins: string | string[] | undefined, inputPlugins: string | string[] | undefined): string[] => normalizePluginArray(initPlugins).concat(normalizePluginArray(inputPlugins));

export const isBeforeInputEventAvailable = () => window.InputEvent && typeof (InputEvent.prototype as any).getTargetRanges === 'function';

export const setMode = (editor: HugeRTEEditor | undefined, mode: 'readonly' | 'design') => {
  if (editor !== undefined) {
    editor.mode.set(mode);
  }
};