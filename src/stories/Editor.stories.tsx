/**
 * Official HugeRTE React component
 * Copyright (c) 2022 Ephox Corporation DBA Tiny Technologies, Inc.
 * Copyright (c) 2024 HugeRTE contributors
 * Licensed under the MIT license (https://github.com/hugerte/hugerte-react/blob/main/LICENSE.TXT)
 */
import React from 'react';
import { EditorEvent, Events, Editor as HugeRTEEditor } from 'hugerte';
import { StoryObj } from '@storybook/react';
import { Editor, IAllProps } from '../main/ts/components/Editor';

const initialValue = `
<h2 style="text-align: center;">
  HugeRTE provides a <span style="text-decoration: underline;">feature-rich</span> rich text editing experience.
</h2>
<p style="text-align: center;">
  <strong><span style="font-size: 14pt;"><span style="color: #7e8c8d; font-weight: 600;">If you're building an application that needs Rich Text Editing, check out HugeRTE!</span></span></strong>
</p>`.trim();

/** Assigning this on a StoryObj will allow its args to be modified. */
const argTypes = {
  // Define arg types that need it, i.e. ones that haven't got a good default:
  plugins: { control: { type: 'text' }},
  toolbar: { control: { type: 'text' }},
  cloudChannel: { control: { type: 'text' }},
  rollback: { control: { type: 'number' }}
};

export default {
  title: 'Editor',
  component: Editor,
  parameters: {
    actions: {
      disable: true
    }
  }
};

export const IframeEditor: StoryObj<Editor> = {
  args: {
    initialValue,
  },
  argTypes,
};

export const InlineEditor: StoryObj<Editor> = {
  args: {
    initialValue,
    inline: true,
  },
  argTypes,
  render: (args) => (
    <div style={{ paddingTop: '100px' }}>
      <Editor
        {...args as IAllProps}
      />
    </div>
  )
};

export const ControlledInput: StoryObj<Editor> = {
  render: () => {
    const [ data, setData ] = React.useState(initialValue);
    return (
      <div>
        <Editor
          value={data}
          onEditorChange={(e) => setData(e)}
        />
        <textarea
          style={{ width: '100%', height: '200px' }}
          value={data}
          onChange={(e) => setData(e.target.value)}
        />
      </div>
    );
  }
};

// The editor will enforce a value that is given to it.
// Note that the value must be valid HTML or it will get in an endless loop
// forever correcting it and then rolling back the change.
// TODO: That should not be the case. The value that the editor enforces
// should be the corrected, not the original HTML.
export const ControlledInputFixed: StoryObj<Editor> = {
  render: () =>
    <Editor
      value='<p>This value is <strong>fixed</strong> and can not be <em>changed</em>.</p>'
    />
};

export const ControlledInputLimitLength: StoryObj<Editor> = {
  render: () => {
    const sizeLimit = 50;
    const [ data, setData ] = React.useState('<p>This field can only take 50 characters.</p>');
    const [ len, setLen ] = React.useState(0);

    const handleInit = (evt: unknown, editor: HugeRTEEditor) => {
      setLen(editor.getContent({ format: 'text' }).length);
    };

    const handleUpdate = (value: string, editor: HugeRTEEditor) => {
      const length = editor.getContent({ format: 'text' }).length;
      if (length <= sizeLimit) {
        setData(value);
        setLen(length);
      }
    };

    const handleBeforeAddUndo = (evt: EditorEvent<Events.EditorEventMap['BeforeAddUndo']>, editor: HugeRTEEditor) => {
      const length = editor.getContent({ format: 'text' }).length;
      // note that this is the opposite test as in handleUpdate
      // because we are determining when to deny adding an undo level
      if (length > sizeLimit) {
        evt.preventDefault();
      }
    };

    return (
      <div>
        <Editor
          value={data}
          onEditorChange={handleUpdate}
          onBeforeAddUndo={handleBeforeAddUndo}
          onInit={handleInit}
        />
        <p>Remaining: {sizeLimit - len}</p>
      </div>
    );
  }
};

export const ToggleDisabledProp: StoryObj<Editor> = {
  render: () => {
    const [ disabled, setDisabled ] = React.useState(true);
    const toggleDisabled = () => setDisabled((prev) => !prev);
    return (
      <div>
        <Editor
          initialValue={initialValue}
          disabled={disabled}
        />
        <button onClick={toggleDisabled}>
          {disabled ? 'Enable Editor' : 'Disable Editor'}
        </button>
      </div>
    );
  }
};

// TODO: is the page refresh really necessary?
export const CDNVersionSetTo1: StoryObj<Editor> = {
  name: 'CDN Version set to "1"',
  render: () => (
    <div>
      <Editor
        cdnVersion='1'
        initialValue={initialValue}
      />
      <p>Refresh the page to ensure a load from the "1" CDN version.</p>
    </div>
  )
};
