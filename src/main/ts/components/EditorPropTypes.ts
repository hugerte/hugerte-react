/**
 * Official HugeRTE React component
 * Copyright (c) 2022 Ephox Corporation DBA Tiny Technologies, Inc.
 * Copyright (c) 2024 HugeRTE contributors
 * Licensed under the MIT license (https://github.com/hugerte/hugerte-react/blob/main/LICENSE.TXT)
 */
import * as PropTypes from 'prop-types';
import { IEvents } from '../Events';
import { IProps } from './Editor';

export type CopyProps<T> = { [P in keyof T]: PropTypes.Requireable<unknown> };

export type IEventPropTypes = CopyProps<IEvents>;

export interface IEditorPropTypes extends IEventPropTypes, CopyProps<IProps> {}

export const eventPropTypes: IEventPropTypes = {
  onActivate: PropTypes.func,
  onAddUndo: PropTypes.func,
  onBeforeAddUndo: PropTypes.func,
  onBeforeExecCommand: PropTypes.func,
  onBeforeGetContent: PropTypes.func,
  onBeforeRenderUI: PropTypes.func,
  onBeforeSetContent: PropTypes.func,
  onBeforePaste: PropTypes.func,
  onBlur: PropTypes.func,
  onChange: PropTypes.func,
  onClearUndos: PropTypes.func,
  onClick: PropTypes.func,
  onContextMenu: PropTypes.func,
  onCommentChange: PropTypes.func,
  onCompositionEnd: PropTypes.func,
  onCompositionStart: PropTypes.func,
  onCompositionUpdate: PropTypes.func,
  onCopy: PropTypes.func,
  onCut: PropTypes.func,
  onDblclick: PropTypes.func,
  onDeactivate: PropTypes.func,
  onDirty: PropTypes.func,
  onDrag: PropTypes.func,
  onDragDrop: PropTypes.func,
  onDragEnd: PropTypes.func,
  onDragGesture: PropTypes.func,
  onDragOver: PropTypes.func,
  onDrop: PropTypes.func,
  onExecCommand: PropTypes.func,
  onFocus: PropTypes.func,
  onFocusIn: PropTypes.func,
  onFocusOut: PropTypes.func,
  onGetContent: PropTypes.func,
  onHide: PropTypes.func,
  onInit: PropTypes.func,
  onInput: PropTypes.func,
  onKeyDown: PropTypes.func,
  onKeyPress: PropTypes.func,
  onKeyUp: PropTypes.func,
  onLoadContent: PropTypes.func,
  onMouseDown: PropTypes.func,
  onMouseEnter: PropTypes.func,
  onMouseLeave: PropTypes.func,
  onMouseMove: PropTypes.func,
  onMouseOut: PropTypes.func,
  onMouseOver: PropTypes.func,
  onMouseUp: PropTypes.func,
  onNodeChange: PropTypes.func,
  onObjectResizeStart: PropTypes.func,
  onObjectResized: PropTypes.func,
  onObjectSelected: PropTypes.func,
  onPaste: PropTypes.func,
  onPostProcess: PropTypes.func,
  onPostRender: PropTypes.func,
  onPreProcess: PropTypes.func,
  onProgressState: PropTypes.func,
  onRedo: PropTypes.func,
  onRemove: PropTypes.func,
  onReset: PropTypes.func,
  onSaveContent: PropTypes.func,
  onSelectionChange: PropTypes.func,
  onSetAttrib: PropTypes.func,
  onSetContent: PropTypes.func,
  onShow: PropTypes.func,
  onSubmit: PropTypes.func,
  onUndo: PropTypes.func,
  onVisualAid: PropTypes.func,
  onSkinLoadError: PropTypes.func,
  onThemeLoadError: PropTypes.func,
  onModelLoadError: PropTypes.func,
  onPluginLoadError: PropTypes.func,
  onIconsLoadError: PropTypes.func,
  onLanguageLoadError: PropTypes.func,
  onScriptsLoad: PropTypes.func,
  onScriptsLoadError: PropTypes.func,
};

export const EditorPropTypes: IEditorPropTypes = {
  id: PropTypes.string,
  inline: PropTypes.bool,
  init: PropTypes.object,
  initialValue: PropTypes.string,
  onEditorChange: PropTypes.func,
  value: PropTypes.string,
  tagName: PropTypes.string,
  tabIndex: PropTypes.number,
  cdnVersion: PropTypes.string,
  plugins: PropTypes.oneOfType([ PropTypes.string, PropTypes.array ]),
  toolbar: PropTypes.oneOfType([ PropTypes.string, PropTypes.array ]),
  disabled: PropTypes.bool,
  textareaName: PropTypes.string,
  hugerteScriptSrc: PropTypes.string,
  rollback: PropTypes.oneOfType([ PropTypes.number, PropTypes.oneOf([ false ]) ]),
  scriptLoading: PropTypes.shape({
    async: PropTypes.bool,
    defer: PropTypes.bool,
    delay: PropTypes.number
  }),
  ...eventPropTypes
};
