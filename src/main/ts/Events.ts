/**
 * Official HugeRTE React component
 * Copyright (c) 2022 Ephox Corporation DBA Tiny Technologies, Inc.
 * Copyright (c) 2024 HugeRTE contributors
 * Licensed under the MIT license (https://github.com/hugerte/hugerte-react/blob/main/LICENSE.TXT)
 */
import type { Editor as HugeRTEEditor, EditorEvent, Events } from 'hugerte';
import { customEvents, nativeEvents, validEvents } from '@hugerte/framework-integration-shared';

export type EventHandler<A> = (a: EditorEvent<A>, editor: HugeRTEEditor) => unknown;

type EEventHandler<K extends keyof Events.EditorEventMap> = EventHandler<Events.EditorEventMap[K]>;

/** Ensures that T extends U, and returns T. */
type EnsureExtends<T extends U, U> = T;

export type INativeEvents = EnsureExtends<{
  onBeforePaste: EEventHandler<'beforepaste'>;
  onBlur: EEventHandler<'blur'>;
  onClick: EEventHandler<'click'>;
  onCompositionEnd: EEventHandler<'compositionend'>;
  onCompositionStart: EEventHandler<'compositionstart'>;
  onCompositionUpdate: EEventHandler<'compositionupdate'>;
  onContextMenu: EEventHandler<'contextmenu'>;
  onCopy: EEventHandler<'copy'>;
  onCut: EEventHandler<'cut'>;
  onDblclick: EEventHandler<'dblclick'>;
  onDrag: EEventHandler<'drag'>;
  onDragDrop: EEventHandler<'dragdrop'>;
  onDragEnd: EEventHandler<'dragend'>;
  onDragGesture: EEventHandler<'draggesture'>;
  onDragOver: EEventHandler<'dragover'>;
  onDrop: EEventHandler<'drop'>;
  onFocus: EEventHandler<'focus'>;
  onFocusIn: EEventHandler<'focusin'>;
  onFocusOut: EEventHandler<'focusout'>;
  onInput: EEventHandler<'input'>;
  onKeyDown: EEventHandler<'keydown'>;
  onKeyPress: EEventHandler<'keypress'>;
  onKeyUp: EEventHandler<'keyup'>;
  onMouseDown: EEventHandler<'mousedown'>;
  onMouseEnter: EEventHandler<'mouseenter'>;
  onMouseLeave: EEventHandler<'mouseleave'>;
  onMouseMove: EEventHandler<'mousemove'>;
  onMouseOut: EEventHandler<'mouseout'>;
  onMouseOver: EEventHandler<'mouseover'>;
  onMouseUp: EEventHandler<'mouseup'>;
  onPaste: EEventHandler<'paste'>;
  onSelectionChange: EEventHandler<'selectionchange'>;
}, Record<`on${typeof nativeEvents[number]}`, unknown>>;

export type ICustomEvents = EnsureExtends<{
  onActivate: EEventHandler<'activate'>;
  onAddUndo: EEventHandler<'AddUndo'>;
  onBeforeAddUndo: EEventHandler<'BeforeAddUndo'>;
  onBeforeExecCommand: EEventHandler<'BeforeExecCommand'>;
  onBeforeGetContent: EEventHandler<'BeforeGetContent'>;
  onBeforeRenderUI: EventHandler<unknown>;
  onBeforeSetContent: EEventHandler<'BeforeSetContent'>;
  onChange: EventHandler<unknown>;
  onClearUndos: EEventHandler<'ClearUndos'>;
  onCommentChange: EventHandler<unknown>;
  onDeactivate: EEventHandler<'deactivate'>;
  onDirty: EventHandler<unknown>;
  onExecCommand: EEventHandler<'ExecCommand'>;
  onGetContent: EEventHandler<'GetContent'>;
  onHide: EventHandler<unknown>;
  onInit: EEventHandler<'init'>;
  onLoadContent: EEventHandler<'LoadContent'>;
  onNodeChange: EEventHandler<'NodeChange'>;
  onPostProcess: EventHandler<unknown>;
  onPostRender: EEventHandler<'PostRender'>;
  onPreProcess: EventHandler<unknown>;
  onProgressState: EEventHandler<'ProgressState'>;
  onRedo: EEventHandler<'Redo'>;
  onRemove: EEventHandler<'remove'>;
  onReset: EventHandler<unknown>;
  onResizeEditor: EventHandler<unknown>; // TODO don't know if EEventHandler<'resize'> would be what we need
  onSaveContent: EventHandler<unknown>;
  onSetAttrib: EventHandler<unknown>;
  onObjectResizeStart: EEventHandler<'ObjectResizeStart'>;
  onObjectResized: EEventHandler<'ObjectResized'>;
  onObjectSelected: EEventHandler<'ObjectSelected'>;
  onSetContent: EEventHandler<'SetContent'>;
  onShow: EventHandler<unknown>;
  onSubmit: EventHandler<unknown>;
  onUndo: EEventHandler<'Undo'>;
  onVisualAid: EventHandler<unknown>;
  onSkinLoadError: EEventHandler<'SkinLoadError'>;
  onThemeLoadError: EEventHandler<'ThemeLoadError'>;
  onModelLoadError: EEventHandler<'ModelLoadError'>;
  onPluginLoadError: EEventHandler<'PluginLoadError'>;
  onIconsLoadError: EEventHandler<'IconsLoadError'>;
  onLanguageLoadError: EEventHandler<'LanguageLoadError'>;
  // TODO: these are specific to the React script loader (which we'll soon want to replace with the shared one)
  onScriptsLoad: () => void;
  onScriptsLoadError: (err: unknown) => void;
}, Record<`on${typeof customEvents[number]}`, unknown>>;

export type IEvents = EnsureExtends<INativeEvents & ICustomEvents, Record<`on${typeof validEvents[number]}`, unknown>>;
