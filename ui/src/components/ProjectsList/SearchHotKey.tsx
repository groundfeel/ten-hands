import React, { Component } from "react";
import { Hotkeys, Hotkey, HotkeysTarget } from "@blueprintjs/core";

interface ISearchHotKeyProps {
  searchbarOpen: boolean;
  setSearchbarOpen: (boolean) => any;
}

@HotkeysTarget
class SearchHotKey extends Component<ISearchHotKeyProps, {}> {
  public render() {
    return <span style={{ position: "absolute", top: -100, left: -100 }} />;
  }

  public renderHotkeys() {
    const { searchbarOpen, setSearchbarOpen } = this.props;
    return (
      <Hotkeys>
        <Hotkey
          global={true}
          combo="ctrl+f"
          label="Search"
          onKeyDown={() => {
            if (!searchbarOpen) {
              setSearchbarOpen(true);
            }
          }}
        />
      </Hotkeys>
    );
  }
}
export default SearchHotKey;