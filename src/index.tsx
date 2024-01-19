import { Action, ActionPanel, Color, Form, Icon, Toast, getSelectedText, showToast } from "@raycast/api";
import { useEffect, useState } from "react";
import {
  GET_ACTIVE_APP_SCRIPT,
  GET_APP_LINK_SCRIPT,
  GET_LINK_FROM_BROWSER_SCRIPT,
  SUPPORTED_BROWSERS,
} from "./scripts/scripts";

import { runAppleScript } from "./utils/utils";

type Values = {
  textfield: string;
  textarea: string;
  datepicker: Date;
  checkbox: boolean;
  dropdown: string;
  tokeneditor: string[];
};

export default function Capture() {
  const [selectedText, setSelectedText] = useState<string>("");
  const [includeHighlight, setIncludeHighlight] = useState<boolean>(true);
  const [appLink, setAppLink] = useState<{ appName: string; appLink: string }>();
  const [resourceInfo, setResourceInfo] = useState<string>("");

  const [selectedResource, setSelectedResource] = useState<string>("");

  useEffect(() => {}, []);

  useEffect(() => {
    const setText = async () => {
      try {
        const activeApp = await runAppleScript(GET_ACTIVE_APP_SCRIPT);
        if (SUPPORTED_BROWSERS.includes(activeApp)) {
          const linkInfoStr = await runAppleScript(GET_LINK_FROM_BROWSER_SCRIPT(activeApp));
          const [url, title] = linkInfoStr.split("\t");
          if (url && title) {
            setSelectedResource(url);
            setResourceInfo(title);
          }
        }
      } catch (error) {
        console.log(error);
      }

      try {
        const data = await getSelectedText();
        if (data) {
          setSelectedText(data);
          console.log(data);
        }
      } catch (error) {
        console.log(error);
      }
    };

    const setAppUri = async () => {
      try {
        const appName = await runAppleScript(GET_ACTIVE_APP_SCRIPT);
        const appLink = await runAppleScript(GET_APP_LINK_SCRIPT);
        if (appLink) {
          setAppLink({ appName, appLink });
        }
      } catch (error) {
        console.error(error);
      }
    };

    setText();
    setAppUri();
  }, []);

  useEffect(() => {
    if (selectedText && selectedResource) {
      showToast({
        style: Toast.Style.Success,
        title: "Highlighted text & Source captured",
      });
    } else if (selectedText) {
      showToast({
        style: Toast.Style.Success,
        title: "Highlighted text captured",
      });
    } else if (selectedResource) {
      showToast({
        style: Toast.Style.Success,
        title: "Link captured",
      });
    }
  }, [selectedText, selectedResource]);

  function handleSubmit(values: Values) {
    console.log(values);
    showToast({ title: "Submitted form", message: "See logs for submitted values" });
  }

  const timer = (time: number) => new Promise((resolve) => setTimeout(resolve, time));

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      {selectedText && (
        <Form.TextArea
          id="selectedTextArea"
          title="Selected Text"
          value={selectedText}
          onChange={(value) => setSelectedText(value)}
        />
      )}
      {selectedResource && resourceInfo && (
        <Form.TagPicker id="link" title="Link" defaultValue={[selectedResource]}>
          <Form.TagPicker.Item
            value={selectedResource}
            title={resourceInfo}
            icon={{ source: Icon.Circle, tintColor: Color.Red }}
          />
        </Form.TagPicker>
      )}
      {appLink && (
        <>
          <Form.TextField
            id="appNameTextField"
            title="App Name"
            value={appLink.appName}
            onChange={(value) => setAppLink({ ...appLink, appName: value })}
          />
          <Form.Description text="URI link to the app" />
          <Form.TextField
            id="appLinkTextField"
            title="App Link"
            value={appLink.appLink}
            onChange={(value) => setAppLink({ ...appLink, appLink: value })}
          />
        </>
      )}
    </Form>
  );
}
