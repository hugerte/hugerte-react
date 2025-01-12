import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Editor, IAllProps, IProps, Version } from '../../../main/ts/components/Editor';
import { HugeRTE, Editor as HugeRTEEditor } from 'hugerte';
import { before, context } from '@ephox/bedrock-client';
import { cleanupGlobalHugeRTE } from '../alien/TestHelpers';

/* Based on code from TinyMCE, MODIFIED */
/* See LEGAL.txt for the original license information */
const loadScript = (url: string, success: () => void, failure: (err: Error) => void): void => {
  const script = document.createElement('script');
  script.src = url;

  const onLoad = () => {
    script.removeEventListener('load', onLoad);
    script.removeEventListener('error', onError);
    success();
  };

  const onError = () => {
    script.removeEventListener('error', onError);
    script.removeEventListener('load', onLoad);
    failure(new Error(`Failed to load script: ${url}`));
  };

  script.addEventListener('load', onLoad);
  script.addEventListener('error', onError);
  document.body.appendChild(script);
};

const getHugeRTE = (): HugeRTE | undefined => (globalThis as any).hugerte as HugeRTE | undefined;

const setHugeRTEBaseUrl = (hugerte: any, baseUrl: string): void => {
  const prefix = document.location.protocol + '//' + document.location.host;
  hugerte.baseURL = baseUrl.indexOf('://') === -1 ? prefix + baseUrl : baseUrl;
  hugerte.baseURI = new hugerte.util.URI(hugerte.baseURL);
};

const updateHugeRTEUrls = (packageName: string): void => {
  const hugerte = getHugeRTE();
  if (hugerte) {
    setHugeRTEBaseUrl(hugerte, `/project/node_modules/${packageName}`);
  }
};

const versionToPackageName = (version: string) => version === 'latest' ? 'hugerte' : `hugerte-${version}`;

const unload = (): void => {
  const hugerte = getHugeRTE();
  if (hugerte) {
    hugerte.remove();
  }
  cleanupGlobalHugeRTE();
};

const load = (version: string, success: () => void, failure: (err: Error) => void): void => {
  const packageName = versionToPackageName(version);

  unload();
  loadScript(`/project/node_modules/${packageName}/hugerte.min.js`, () => {
    updateHugeRTEUrls(versionToPackageName(version));
    success();
  }, failure);
};

const pLoadVersion = (version: string): Promise<void> =>
  new Promise((resolve, reject) => {
    load(version, resolve, reject);
  });
/* End of code based on Apache-licensed code. */

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
  const originalSetup = originalInit.setup || (() => {});
  const ref = React.createRef<Editor>();

  const ctx = await new Promise<Context>((resolve, reject) => {
    const init: IProps['init'] = {
      ...originalInit,
      setup: (editor) => {
        originalSetup(editor);

        editor.on('SkinLoaded', () => {
          setTimeout(() => {
            const DOMNode = ReactDOM.findDOMNode(ref.current);
            if (!DOMNode) {
              return reject('Could not find DOMNode');
            }
            if (!(DOMNode instanceof HTMLElement)) {
              // TODO: this new error message should come into the changelog
              return reject('Element is not an HTMLElement');
            }
            resolve({
              ref,
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
    ReactDOM.render(<div><Editor ref={ref} {...props} init={init} /></div>, container);
  });

  const remove = () => {
    ReactDOM.unmountComponentAtNode(container);
  };

  return {
    ...ctx,
    /** By rendering the Editor into the same root, React will perform a diff and update. */
    reRender: (newProps: IAllProps) => new Promise<void>((resolve) =>
      ReactDOM.render(<div><Editor ref={ctx.ref} {...newProps} /></div>, container, resolve)
    ),
    remove,
    [Symbol.dispose]: remove
  };
};

type RenderWithVersion = (
  props: Omit<IAllProps, 'cloudChannel' | 'tinymceScriptSrc'>,
  container?: HTMLElement | HTMLDivElement
) => Promise<ReactEditorContext>;

export const withVersion = (version: Version, fn: (render: RenderWithVersion) => void): void => {
  context(`TinyMCE (${version})`, () => {
    before(async () => {
      await pLoadVersion(version);
    });

    fn(render as RenderWithVersion);
  });
};
