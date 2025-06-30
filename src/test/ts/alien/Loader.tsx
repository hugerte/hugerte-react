import { createRoot } from 'react-dom/client';
import * as React from 'react';
import { Editor, IAllProps, IProps, Version } from '../../../main/ts/components/Editor';
import { Editor as HugeRTEEditor } from 'hugerte';
import { before, context } from '@ephox/bedrock-client';
import { pLoadVersion } from '@hugerte/framework-integration-shared';

// @ts-expect-error Remove when dispose polyfill is not needed
Symbol.dispose ??= Symbol('Symbol.dispose');
// @ts-expect-error Remove when dispose polyfill is not needed
Symbol.asyncDispose ??= Symbol('Symbol.asyncDispose');

export interface Context {
  DOMNode: HTMLElement;
  editor: HugeRTEEditor;
  ref: React.RefObject<Editor>;
}

const getRoot = () => document.getElementById('root') ?? (() => {
  const root = document.createElement('div');
  root.id = 'root';
  document.body.appendChild(root);
  return root;
})();
export interface ReactEditorContext extends Context, Disposable {
  reRender(props: IAllProps): Promise<void>;
  remove(): void;
}

export const render = async (props: Partial<IAllProps> = {}, container: HTMLElement = getRoot()): Promise<ReactEditorContext> => {
  const originalInit = props.init || {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const originalSetup = originalInit.setup || (() => {});
  const ref = React.createRef<Editor>();

  const root = createRoot(container);

  const ctx = await new Promise<Context>((resolve, reject) => {
    const init: IProps['init'] = {
      ...originalInit,
      setup: (editor) => {
        originalSetup(editor);

        editor.on('SkinLoaded', () => {
          setTimeout(() => {
            const DOMNode = ref.current?.editor?.targetElm;
            if (!DOMNode) {
              reject('Could not find DOMNode');
              return;
            }
            if (!(DOMNode instanceof window.HTMLElement)) {
              // TODO: this new error message should come into the changelog
              reject('Element is not an HTMLElement');
              return;
            }
            resolve({
              ref: ref as React.RefObject<Editor>,
              editor,
              DOMNode,
            });
          }, 0);
        });
      }
    };

    /**
     * TODO: Check if this note also applies to higher TinyMCE versions and also to HugeRTE.
     * NOTE: TinyMCE will manipulate the DOM directly and this may cause issues with React's virtual DOM getting
     * out of sync. The official fix for this is wrap everything (textarea + editor) in an element. As far as React
     * is concerned, the wrapper always only has a single child, thus ensuring that React doesn’t have a reason to
     * touch the nodes created by TinyMCE. Since this only seems to be an issue when rendering TinyMCE 4 directly
     * into a root and a fix would be a breaking change, let's just wrap the editor in a <div> here for now.
     */
    root.render(<div><Editor ref={ref} {...props} init={init} /></div>);
  });

  const remove = () => {
    root.unmount();
    container.remove();
  };

  return {
    ...ctx,
    /** By rendering the Editor into the same root, React will perform a diff and update. */
    reRender: (newProps: IAllProps) => new Promise<void>((resolve) => {
      root.render(<div><Editor ref={ctx.ref} {...newProps} /></div>);
      // TODO Why is this necessary now?!
      if (newProps.disabled) {
        ctx.editor.mode.set('readonly');
      }
      newProps.value
        ? ctx.editor.once('change', (_event) => resolve())
        : resolve();
    }),
    remove,
    [Symbol.dispose]: remove
  };
};

type RenderWithVersion = (
  props: Omit<IAllProps, 'cdnVersion' | 'hugerteScriptSrc'>,
  container?: HTMLElement | HTMLDivElement
) => Promise<ReactEditorContext>;

export const withVersion = (version: Version, fn: (render: RenderWithVersion) => void): void => {
  context(`HugeRTE (${version})`, () => {
    before(async () => {
      await pLoadVersion(version);
    });

    fn(render as RenderWithVersion);
  });
};
