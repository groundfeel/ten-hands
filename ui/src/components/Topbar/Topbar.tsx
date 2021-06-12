import { Alignment, Button, Classes, Navbar } from "@blueprintjs/core";
import React from "react";

import { useTheme } from "../shared/stores/ThemeStore";

interface ITopbarProps {
  theme?: string;
  setTheme?: any;
}

const Topbar: React.FC<ITopbarProps> = React.memo(() => {
  const { theme, setTheme } = useTheme();
  return (
    <Navbar fixedToTop={true}>
      <Navbar.Group align={Alignment.LEFT}>
        <Navbar.Heading>Ten Hands</Navbar.Heading>
        <Navbar.Divider />
      </Navbar.Group>
      <Navbar.Group align={Alignment.RIGHT}>
        {theme === Classes.DARK ? (
          <Button
            data-testid="theme-light"
            icon="flash"
            onClick={() => setTheme(`light`)}
            minimal={true}
          />
        ) : (
          <Button
            data-testid="theme-dark"
            icon="moon"
            onClick={() => setTheme(Classes.DARK)}
            minimal={true}
          />
        )}
      </Navbar.Group>
    </Navbar>
  );
});

export default Topbar;
