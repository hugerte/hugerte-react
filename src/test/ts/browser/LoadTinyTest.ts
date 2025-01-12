/* eslint-disable @typescript-eslint/no-unused-vars */
import { Assertions } from '@ephox/agar';
import { beforeEach, describe, it } from '@ephox/bedrock-client';

import { CDN_VERSIONS, VERSIONS, type Version } from '../alien/TestHelpers';
import { render } from '../alien/Loader';
import { ScriptLoader } from 'src/main/ts/ScriptLoader2';

const assertHugeRTEVersion = (version: Version) => {
  Assertions.assertEq(`Loaded version of HugeRTE should be ${version}`, version, (globalThis as any).hugerte.majorVersion);
};

export const deleteHugeRTE = () => {
  ScriptLoader.reinitialize();

  delete (globalThis as any).hugerte;
  delete (globalThis as any).hugeRTE;

  const hasHugeRTEUri = (attrName: string) => (elm: Element) => {
    const src = elm.getAttribute(attrName);
    return src != null && src.includes('hugerte');
  };

  [
    ...Array.from(document.querySelectorAll('script')).filter(hasHugeRTEUri('src')),
    ...Array.from(document.querySelectorAll('link')).filter(hasHugeRTEUri('href'))
  ].forEach((elm) => elm.remove());
};

describe('LoadTinyTest', () => {
  beforeEach(() => {
    deleteHugeRTE();
  });

  VERSIONS.forEach((version) => {
    it(`Should be able to load local version (${version}) of HugeRTE using the hugerteScriptSrc prop`, async () => {
      using _ = await render({ hugerteScriptSrc: `/project/node_modules/hugerte-${version}/hugerte.min.js` });
      assertHugeRTEVersion(version);
    });
  });

  CDN_VERSIONS.forEach((version) => {
    it(`Should be able to load HugeRTE from CDN (${version})`, async () => {
      using _ = await render({ cdnVersion: version });
      assertHugeRTEVersion(version);
      Assertions.assertEq(
        'HugeRTE should have been loaded from jsDelivr CDN',
        `https://cdn.jsdelivr.net/npm/hugerte@${version}`,
        (globalThis as any).hugerte.baseURI.source
      );
    });
  });
});
