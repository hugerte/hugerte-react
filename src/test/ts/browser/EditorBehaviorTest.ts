import * as Loader from '../alien/Loader';

import { describe, it } from '@ephox/bedrock-client';

import { getHugeRTE } from '../../../main/ts/HugeRTE';
import { EventStore, VERSIONS } from '../alien/TestHelpers';
import { Editor as HugeRTEEditor, EditorEvent, Events } from 'hugerte';
import { Assertions } from '@ephox/agar';

type SetContentEvent = EditorEvent<Events.EditorEventMap['SetContent']>;

describe('EditorBehaviourTest', () => {
  // See lines 40 and 105
  // const versionRegex = /6|7/;

  const isEditor = (val: unknown): val is HugeRTEEditor => {
    const hugerte = getHugeRTE(window);
    if (!hugerte) {
      return false;
    }
    return val instanceof hugerte.Editor;
  };

  const eventStore = EventStore();

  VERSIONS.forEach((version) =>
    Loader.withVersion(version, (render) => {
      it('Assert structure of hugerte and hugerte-react events', async () => {
        using ctx = await render({
          onEditorChange: eventStore.createHandler('onEditorChange'),
          onSetContent: eventStore.createHandler('onSetContent'),
        });

        // hugerte native event
        // initial content is empty as editor does not have a value or initialValue
        eventStore.each<SetContentEvent>('onSetContent', (events) => {
          // note that this difference in behavior in TinyMCE 5-6 may be a bug, TODO investigate for HugeRTE
          Assertions.assertEq(
            'First arg should be event from HugeRTE',
            /* versionRegex.test(version) */ true ? '<p><br data-mce-bogus="1"></p>' : '',
            events[0].editorEvent.content
          );
          Assertions.assertEq('Second arg should be editor', true, isEditor(events[0].editor));
        });
        eventStore.clearState();

        ctx.editor.setContent('<p>Initial Content</p>');
        // hugerte native event
        eventStore.each<SetContentEvent>('onSetContent', (events) => {
          Assertions.assertEq('onSetContent should have been fired once', 1, events.length);
          Assertions.assertEq(
            'First arg should be event from Tiny',
            '<p>Initial Content</p>',
            events[0].editorEvent.content
          );
          Assertions.assertEq('Second arg should be editor', true, isEditor(events[0].editor));
        });

        // hugerte-react unique event
        eventStore.each<string>('onEditorChange', (events) => {
          Assertions.assertEq('First arg should be new content', '<p>Initial Content</p>', events[0].editorEvent);
          Assertions.assertEq('Second arg should be editor', true, isEditor(events[0].editor));
        });
        eventStore.clearState();
      });

      it('onEditorChange should only fire when the editors content changes', async () => {
        using ctx = await render({
          onEditorChange: eventStore.createHandler('onEditorChange'),
        });

        ctx.editor.setContent('<p>Initial Content</p>');
        ctx.editor.setContent('<p>Initial Content</p>'); // Repeat

        eventStore.each('onEditorChange', (events) => {
          Assertions.assertEq('onEditorChange should have been fired once', 1, events.length);
        });
        eventStore.clearState();
      });

      it('Should be able to register an event handler after initial render', async () => {
        using ctx = await render({ initialValue: '<p>Initial Content</p>' });
        await ctx.reRender({ onSetContent: eventStore.createHandler('onSetContent') });

        Assertions.assertHtml('Checking HugeRTE content', '<p>Initial Content</p>', ctx.editor.getContent());
        ctx.editor.setContent('<p>New Content</p>');

        eventStore.each<SetContentEvent>('onSetContent', (events) => {
          Assertions.assertEq(
            'Should have bound handler, hence new content',
            '<p>New Content</p>',
            events[0].editorEvent.content
          );
        });

        eventStore.clearState();
      });

      it('Providing a new event handler and re-rendering should unbind old handler and bind new handler', async () => {
        using ctx = await render({ onSetContent: eventStore.createHandler('InitialHandler') });
        eventStore.each<SetContentEvent>('InitialHandler', (events) => {
          Assertions.assertEq(
            'Initial content is empty as editor does not have a value or initialValue',
            // note that this difference in behavior in TinyMCE 5-6 may be a bug, TODO investigate for HugeRTE
            /* versionRegex.test(version) */ true ? '<p><br data-mce-bogus="1"></p>' : '',
            events[0].editorEvent.content
          );
        });
        eventStore.clearState();
        ctx.editor.setContent('<p>Initial Content</p>');

        await ctx.reRender({ onSetContent: eventStore.createHandler('NewHandler') });
        ctx.editor.setContent('<p>New Content</p>');

        eventStore.each<SetContentEvent>('InitialHandler', (events) => {
          Assertions.assertEq(
            'Initial handler should have been unbound, hence initial content',
            '<p>Initial Content</p>',
            events[0].editorEvent.content
          );
        });
        eventStore.each<SetContentEvent>('NewHandler', (events) => {
          Assertions.assertEq(
            'New handler should have been bound, hence new content',
            '<p>New Content</p>',
            events[0].editorEvent.content
          );
        });

        eventStore.clearState();
      });
    })
  );
});
