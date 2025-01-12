/**
 * Official HugeRTE React component
 * Copyright (c) 2022 Ephox Corporation DBA Tiny Technologies, Inc.
 * Copyright (c) 2024 HugeRTE contributors
 * Licensed under the MIT license (https://github.com/hugerte/hugerte-react/blob/main/LICENSE.TXT)
 */
import * as React from 'react';
import { IEvents } from '../Events';
import { ScriptItem, ScriptLoader } from '../ScriptLoader2';
import { getHugeRTE } from '../HugeRTE';
import { isFunction, isTextareaOrInput, mergePlugins, uuid, configHandlers, isBeforeInputEventAvailable, isInDoc, setMode } from '../Utils';
import { EditorPropTypes, IEditorPropTypes } from './EditorPropTypes';
import type { Bookmark, Editor as HugeRTEEditor, EditorEvent, HugeRTE } from 'hugerte';

type OmitStringIndexSignature<T> = { [K in keyof T as string extends K ? never : K]: T[K] };

interface DoNotUse<T extends string> {
  __brand: T;
}

type OmittedInitProps = 'selector' | 'target' | 'readonly';

type EditorOptions = Parameters<HugeRTE['init']>[0];

export type InitOptions = Omit<OmitStringIndexSignature<EditorOptions>, OmittedInitProps> & {
  selector?: DoNotUse<'selector prop is handled internally by the component'>;
  target?: DoNotUse<'target prop is handled internally by the component'>;
  readonly?: DoNotUse<'readonly prop is overridden by the component, use the `disabled` prop instead'>;
} & { [key: string]: unknown };

export type Version = `${'1'}${'' | `.${number}` | `.${number}.${number}`}`;

export interface IProps {
  /**
   * @see {@link https://www.hugerte.org/docs/hugerte/1/react-ref/#id React Tech Ref - id}
   * @description The ID of the element to render the editor into.
   */
  id: string;
  /**
   * @see {@link https://www.hugerte.org/docs/hugerte/1/react-ref/#inline React Tech Ref - inline}
   * @description Whether the editor should be rendered inline. Equivalent to the `inline` option in HugeRTE.
   */
  inline: boolean;
  /**
   * @see {@link https://www.hugerte.org/docs/hugerte/1/react-ref/#initialvalue React Tech Ref - initialValue}
   * @description The initial HTML content of the editor.
   *
   * IMPORTANT: Ensure that this is **not** updated by `onEditorChange` or the editor will be unusable.
   */
  initialValue: string;
  /**
   * @see {@link https://www.hugerte.org/docs/hugerte/1/react-ref/#oneditorchange React Tech Ref - onEditorChange}
   * @description Used to store the state of the editor outside the component. Typically used for controlled components.
   * @param a The current HTML content of the editor.
   * @param editor The HugeRTE editor instance.
   * @returns void
   */
  onEditorChange: (a: string, editor: HugeRTEEditor) => void;
  /**
   * @see {@link https://www.hugerte.org/docs/hugerte/1/react-ref/#value React Tech Ref - value}
   * @description The current HTML content of the editor. Typically used for controlled components.
   */
  value: string;
  /**
   * @see {@link https://www.hugerte.org/docs/hugerte/1/react-ref/#init React Tech Ref - init}
   * @description Additional settings passed to `hugerte.init()` when initializing the editor.
   */
  init: InitOptions;
  /**
   * @see {@link https://www.hugerte.org/docs/hugerte/1/react-ref/#tagname React Tech Ref - tagName}
   * @description The tag name of the element to render the editor into. Only valid when `inline` is `true`.
   */
  tagName: string;
  /**
   * @see {@link https://www.hugerte.org/docs/hugerte/1/react-ref/#tabIndex React Tech Ref - tabIndex}
   * @description The tab index of the element that the editor wraps.
   */
  tabIndex: number;
  /**
   * @description The HugeRTE version to use when loading from jsDelivr CDN. By default, version 1
   * (that is, the latest minor and patch release of the major version 1) will be used.
   * For more info about the possible version formats, see the {@link https://www.jsdelivr.com/documentation#id-npm jsDelivr documentation}.
   */
  cdnVersion: Version;
  /**
   * @see {@link https://www.hugerte.org/docs/hugerte/1/react-ref/#plugins React Tech Ref - plugins}
   * @description The plugins to load into the editor. Equivalent to the `plugins` option in HugeRTE.
   */
  plugins: NonNullable<EditorOptions['plugins']>;
  /**
   * @see {@link https://www.hugerte.org/docs/hugerte/1/react-ref/#toolbar React Tech Ref - toolbar}
   * @description The toolbar to load into the editor. Equivalent to the `toolbar` option in HugeRTE.
   */
  toolbar: NonNullable<EditorOptions['toolbar']>;
  /**
   * @see {@link https://www.hugerte.org/docs/hugerte/1/react-ref/#disabled React Tech Ref - disabled}
   * @description Whether the editor should be "disabled" (read-only).
   */
  disabled: boolean;
  /**
   * @see {@link https://www.hugerte.org/docs/hugerte/1/react-ref/#textareaname React Tech Ref - textareaName}
   * @description Set the `name` attribute of the `textarea` element used for the editor in forms. Only valid in iframe mode.
   */
  textareaName: string;
  /**
   * @description The URL of the HugeRTE script to lazy load.
   */
  hugerteScriptSrc: string;
  /**
   * @see {@link https://www.hugerte.org/docs/hugerte/1/react-ref/#rollback React Tech Ref - rollback}
   * @description The number of milliseconds to wait before reverting to the previous value when the editor's content changes.
   */
  rollback: number | false;
  /**
   * @see {@link https://www.hugerte.org/docs/hugerte/1/react-ref/#scriptloading React Tech Ref - scriptLoading}
   * @description Options for how the HugeRTE script should be loaded.
   * @property async Whether the script should be loaded with the `async` attribute.
   * @property defer Whether the script should be loaded with the `defer` attribute.
   * @property delay The number of milliseconds to wait before loading the script.
   */
  scriptLoading: {
    async?: boolean;
    defer?: boolean;
    delay?: number;
  };
}

export interface IAllProps extends Partial<IProps>, Partial<IEvents> { }

/**
 * @see {@link https://www.hugerte.org/docs/hugerte/1/react-ref/ HugeRTE React Technical Reference}
 */
export class Editor extends React.Component<IAllProps> {
  public static propTypes: IEditorPropTypes = EditorPropTypes;

  public static defaultProps: Partial<IAllProps> = {
    cdnVersion: '1',
  };

  public editor?: HugeRTEEditor;

  private id: string;
  private elementRef: React.RefObject<HTMLElement>;
  private inline: boolean;
  private currentContent?: string;
  private boundHandlers: Record<string, (event: EditorEvent<unknown>) => unknown>;
  private rollbackTimer: number | undefined = undefined;
  private valueCursor: Bookmark | undefined = undefined;

  public constructor(props: Partial<IAllProps>) {
    super(props);
    this.id = this.props.id || uuid('tiny-react');
    this.elementRef = React.createRef<HTMLElement>();
    this.inline = this.props.inline ?? this.props.init?.inline ?? false;
    this.boundHandlers = {};
  }

  private get view() {
    return this.elementRef.current?.ownerDocument.defaultView ?? window;
  }

  public componentDidUpdate(prevProps: Partial<IAllProps>) {
    if (this.rollbackTimer) {
      clearTimeout(this.rollbackTimer);
      this.rollbackTimer = undefined;
    }
    if (this.editor) {
      this.bindHandlers(prevProps);
      if (this.editor.initialized) {
        this.currentContent = this.currentContent ?? this.editor.getContent();
        if (typeof this.props.initialValue === 'string' && this.props.initialValue !== prevProps.initialValue) {
          // same as resetContent in TinyMCE 5 – TODO what does this mean for HugeRTE?
          this.editor.setContent(this.props.initialValue);
          this.editor.undoManager.clear();
          this.editor.undoManager.add();
          this.editor.setDirty(false);
        } else if (typeof this.props.value === 'string' && this.props.value !== this.currentContent) {
          const localEditor = this.editor;
          localEditor.undoManager.transact(() => {
            // inline editors grab focus when restoring selection
            // so we don't try to keep their selection unless they are currently focused
            let cursor: Bookmark | undefined;
            if (!this.inline || localEditor.hasFocus()) {
              try {
                // getBookmark throws exceptions when the editor has not been focused
                // possibly only in inline mode but I'm not taking chances
                cursor = localEditor.selection.getBookmark(3);
              } catch (e) { /* ignore */ }
            }
            const valueCursor = this.valueCursor;
            localEditor.setContent(this.props.value as string);
            if (!this.inline || localEditor.hasFocus()) {
              for (const bookmark of [ cursor, valueCursor ]) {
                if (bookmark) {
                  try {
                    localEditor.selection.moveToBookmark(bookmark);
                    this.valueCursor = bookmark;
                    break;
                  } catch (e) { /* ignore */ }
                }
              }
            }
          });
        }
        if (this.props.disabled !== prevProps.disabled) {
          const disabled = this.props.disabled ?? false;
          setMode(this.editor, disabled ? 'readonly' : 'design');
        }
      }
    }
  }

  public componentDidMount() {
    if (getHugeRTE(this.view) !== null) {
      this.initialise();
    } else if (Array.isArray(this.props.hugerteScriptSrc) && this.props.hugerteScriptSrc.length === 0) {
      this.props.onScriptsLoadError?.(new Error('No `hugerte` global is present but the `hugerteScriptSrc` prop was an empty array.'));
    } else if (this.elementRef.current?.ownerDocument) {
      const successHandler = () => {
        this.props.onScriptsLoad?.();
        this.initialise();
      };
      const errorHandler = (err: unknown) => {
        this.props.onScriptsLoadError?.(err);
      };
      ScriptLoader.loadList(
        this.elementRef.current.ownerDocument,
        this.getScriptSources(),
        this.props.scriptLoading?.delay ?? 0,
        successHandler,
        errorHandler
      );
    }
  }

  public componentWillUnmount() {
    const editor = this.editor;
    if (editor) {
      editor.off(this.changeEvents(), this.handleEditorChange);
      editor.off(this.beforeInputEvent(), this.handleBeforeInput);
      editor.off('keypress', this.handleEditorChangeSpecial);
      editor.off('keydown', this.handleBeforeInputSpecial);
      editor.off('NewBlock', this.handleEditorChange);
      Object.keys(this.boundHandlers).forEach((eventName) => {
        editor.off(eventName, this.boundHandlers[eventName]);
      });
      this.boundHandlers = {};
      editor.remove();
      this.editor = undefined;
    }
  }

  public render() {
    return this.inline ? this.renderInline() : this.renderIframe();
  }

  private changeEvents() {
    const isIE = getHugeRTE(this.view)?.Env?.browser?.isIE();
    return (isIE
      ? 'change keyup compositionend setcontent CommentChange'
      : 'change input compositionend setcontent CommentChange'
    );
  }

  private beforeInputEvent() {
    return isBeforeInputEventAvailable() ? 'beforeinput SelectionChange' : 'SelectionChange';
  }

  private renderInline() {
    const { tagName = 'div' } = this.props;

    return React.createElement(tagName, {
      ref: this.elementRef,
      id: this.id,
      tabIndex: this.props.tabIndex
    });
  }

  private renderIframe() {
    return React.createElement('textarea', {
      ref: this.elementRef,
      style: { visibility: 'hidden' },
      name: this.props.textareaName,
      id: this.id,
      tabIndex: this.props.tabIndex
    });
  }

  private getScriptSources(): ScriptItem[] {
    const async = this.props.scriptLoading?.async;
    const defer = this.props.scriptLoading?.defer;
    if (this.props.hugerteScriptSrc !== undefined) {
      if (typeof this.props.hugerteScriptSrc === 'string') {
        return [{ src: this.props.hugerteScriptSrc, async, defer }];
      }
    }
    // fallback to jsDelivr CDN when the hugerteScriptSrc is not specified
    // `cdnVersion` is in `defaultProps`, so it's always defined.
    const cdnLink = `https://cdn.jsdelivr.net/npm/hugerte@${this.props.cdnVersion as Version}/hugerte.min.js`;
    return [{ src: cdnLink, async, defer }];
  }

  private getInitialValue() {
    if (typeof this.props.initialValue === 'string') {
      return this.props.initialValue;
    } else if (typeof this.props.value === 'string') {
      return this.props.value;
    } else {
      return '';
    }
  }

  private bindHandlers(prevProps: Partial<IAllProps>) {
    if (this.editor !== undefined) {
      // typescript chokes trying to understand the type of the lookup function
      configHandlers(this.editor, prevProps, this.props, this.boundHandlers, (key) => this.props[key] as any);
      // check if we should monitor editor changes
      const isValueControlled = (p: Partial<IAllProps>) => p.onEditorChange !== undefined || p.value !== undefined;
      const wasControlled = isValueControlled(prevProps);
      const nowControlled = isValueControlled(this.props);
      if (!wasControlled && nowControlled) {
        this.editor.on(this.changeEvents(), this.handleEditorChange);
        this.editor.on(this.beforeInputEvent(), this.handleBeforeInput);
        this.editor.on('keydown', this.handleBeforeInputSpecial);
        this.editor.on('keyup', this.handleEditorChangeSpecial);
        this.editor.on('NewBlock', this.handleEditorChange);
      } else if (wasControlled && !nowControlled) {
        this.editor.off(this.changeEvents(), this.handleEditorChange);
        this.editor.off(this.beforeInputEvent(), this.handleBeforeInput);
        this.editor.off('keydown', this.handleBeforeInputSpecial);
        this.editor.off('keyup', this.handleEditorChangeSpecial);
        this.editor.off('NewBlock', this.handleEditorChange);
      }
    }
  }

  private rollbackChange = () => {
    const editor = this.editor;
    const value = this.props.value;
    if (editor && value && value !== this.currentContent) {
      editor.undoManager.ignore(() => {
        editor.setContent(value);
        // only restore cursor on inline editors when they are focused
        // as otherwise it will cause a focus grab
        if (this.valueCursor && (!this.inline || editor.hasFocus())) {
          try {
            editor.selection.moveToBookmark(this.valueCursor);
          } catch (e) { /* ignore */ }
        }
      });
    }
    this.rollbackTimer = undefined;
  };

  private handleBeforeInput = (_evt: EditorEvent<unknown>) => {
    if (this.props.value !== undefined && this.props.value === this.currentContent && this.editor) {
      if (!this.inline || this.editor.hasFocus()) {
        try {
          // getBookmark throws exceptions when the editor has not been focused
          // possibly only in inline mode but I'm not taking chances
          this.valueCursor = this.editor.selection.getBookmark(3);
        } catch (e) { /* ignore */ }
      }
    }
  };

  private handleBeforeInputSpecial = (evt: EditorEvent<KeyboardEvent>) => {
    if (evt.key === 'Enter' || evt.key === 'Backspace' || evt.key === 'Delete') {
      this.handleBeforeInput(evt);
    }
  };

  private handleEditorChange = (_evt: EditorEvent<unknown>) => {
    const editor = this.editor;
    if (editor && editor.initialized) {
      const newContent = editor.getContent();
      if (this.props.value !== undefined && this.props.value !== newContent && this.props.rollback !== false) {
        // start a timer and revert to the value if not applied in time
        if (!this.rollbackTimer) {
          this.rollbackTimer = window.setTimeout(
            this.rollbackChange,
            typeof this.props.rollback === 'number' ? this.props.rollback : 200
          );
        }
      }

      if (newContent !== this.currentContent) {
        this.currentContent = newContent;
        if (isFunction(this.props.onEditorChange)) {
          this.props.onEditorChange(newContent, editor);
        }
      }
    }
  };

  private handleEditorChangeSpecial = (evt: EditorEvent<KeyboardEvent>) => {
    if (evt.key === 'Backspace' || evt.key === 'Delete') {
      this.handleEditorChange(evt);
    }
  };

  private initialise = (attempts = 0) => {
    const target = this.elementRef.current;
    if (!target) {
      return; // Editor has been unmounted
    }
    if (!isInDoc(target)) {
      // this is probably someone trying to help by rendering us offscreen
      // but we can't do that because the editor iframe must be in the document
      // in order to have state
      if (attempts === 0) {
        // we probably just need to wait for the current events to be processed
        setTimeout(() => this.initialise(1), 1);
      } else if (attempts < 100) {
        // wait for ten seconds, polling every tenth of a second
        setTimeout(() => this.initialise(attempts + 1), 100);
      } else {
        // give up, at this point it seems that more polling is unlikely to help
        throw new Error('hugerte can only be initialised when in a document');
      }
      return;
    }

    const hugerte = getHugeRTE(this.view);
    if (!hugerte) {
      throw new Error('hugerte should have been loaded into global scope');
    }

    const finalInit: EditorOptions = {
      ...this.props.init as Omit<InitOptions, OmittedInitProps>,
      selector: undefined,
      target,
      readonly: this.props.disabled,
      inline: this.inline,
      plugins: mergePlugins(this.props.init?.plugins, this.props.plugins),
      toolbar: this.props.toolbar ?? this.props.init?.toolbar,
      setup: (editor) => {
        this.editor = editor;
        this.bindHandlers({});

        // When running in inline mode the editor gets the initial value
        // from the innerHTML of the element it is initialized on.
        // However we don't want to take on the responsibility of sanitizing
        // to remove XSS in the react integration so we have a chicken and egg
        // problem... We avoid it by sneaking in a set content before the first
        // "official" setContent and using HugeRTE to do the sanitization.
        if (this.inline && !isTextareaOrInput(target)) {
          editor.once('PostRender', (_evt) => {
            editor.setContent(this.getInitialValue(), { no_events: true });
          });
        }

        if (this.props.init && isFunction(this.props.init.setup)) {
          this.props.init.setup(editor);
        }
      },
      init_instance_callback: (editor) => {
        // check for changes that happened since hugerte.init() was called
        const initialValue = this.getInitialValue();
        this.currentContent = this.currentContent ?? editor.getContent();
        if (this.currentContent !== initialValue) {
          this.currentContent = initialValue;
          // same as resetContent in HugeRTE 5
          editor.setContent(initialValue);
          editor.undoManager.clear();
          editor.undoManager.add();
          editor.setDirty(false);
        }
        const disabled = this.props.disabled ?? false;
        setMode(this.editor, disabled ? 'readonly' : 'design');
        // ensure existing init_instance_callback is called
        if (this.props.init && isFunction(this.props.init.init_instance_callback)) {
          this.props.init.init_instance_callback(editor);
        }
      }
    };
    if (!this.inline) {
      target.style.visibility = '';
    }
    if (isTextareaOrInput(target)) {
      target.value = this.getInitialValue();
    }

    hugerte.init(finalInit);
  };
}
