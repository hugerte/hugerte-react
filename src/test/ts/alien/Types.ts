/* Based on code from TinyMCE, MODIFIED (Tiny / TinyMCE -> HugeRTE) */
/* See LEGAL.txt for the original license information */
export interface FakeHugeRTE {
  majorVersion: string;
  minorVersion: string;
}

export interface HugeRTE extends FakeHugeRTE {
  baseURL: string;
  baseURI: any;

  PluginManager: any;

  util: {
    URI: any;
  };

  remove (): void;
  remove (selector: string | Editor): Editor | void;
}

export interface Editor {
  editorManager: any;
}
