export function AppShellScript() {
  const script = `
    (function () {
      function markAppShell() {
        var standalone =
          window.matchMedia("(display-mode: standalone)").matches ||
          window.matchMedia("(display-mode: fullscreen)").matches ||
          window.navigator.standalone === true;
        var native =
          window.Capacitor &&
          window.Capacitor.isNativePlatform &&
          window.Capacitor.isNativePlatform();

        if (standalone || native) {
          document.documentElement.setAttribute("data-app-shell", "true");
        }
      }

      markAppShell();
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
