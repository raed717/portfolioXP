"use client";

import {
  Component,
  lazy,
  Suspense,
  type ComponentType,
  type LazyExoticComponent,
  type ReactNode,
} from "react";
import { APPS } from "@/apps/registry";
import type { AppId, AppProps } from "@/apps/types";
import { useLayoutMode } from "@/hooks/useBreakpoint";
import { useViewport } from "@/hooks/useViewport";
import { TASKBAR_HEIGHT } from "@/lib/layout";
import { useWindows } from "@/store/windows";
import { UnavailableApp } from "./UnavailableApp";
import { Window } from "./Window";
import styles from "./Window.module.css";
import layer from "./WindowManager.module.css";

type LazyApp = LazyExoticComponent<ComponentType<AppProps>>;
const lazyApps = new Map<AppId, LazyApp>();

/** One React.lazy per app, created on first open so every program stays out of the shell bundle (§11.5). */
function getAppComponent(appId: AppId): LazyApp | null {
  const load = APPS[appId].load;
  if (!load) return null;
  let component = lazyApps.get(appId);
  if (!component) {
    component = lazy(load);
    lazyApps.set(appId, component);
  }
  return component;
}

export function WindowManager() {
  const windows = useWindows((s) => s.windows);
  const mode = useLayoutMode();
  const viewport = useViewport();
  const area = { width: viewport.width, height: viewport.height - TASKBAR_HEIGHT[mode] };

  return (
    <div className={layer.layer}>
      {windows.map((win) => {
        const App = getAppComponent(win.appId);
        return (
          <Window key={win.id} win={win} mode={mode} area={area}>
            <AppErrorBoundary windowId={win.id} title={win.title}>
              {App ? (
                <Suspense fallback={<div className={styles.loading}>Loading…</div>}>
                  <App windowId={win.id} params={win.params} />
                </Suspense>
              ) : (
                <UnavailableApp windowId={win.id} title={APPS[win.appId].title} />
              )}
            </AppErrorBoundary>
          </Window>
        );
      })}
    </div>
  );
}

type BoundaryProps = { windowId: string; title: string; children: ReactNode };

/** A crashing program shows the friendly dialog instead of taking the whole desktop down. */
class AppErrorBoundary extends Component<BoundaryProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return <UnavailableApp windowId={this.props.windowId} title={this.props.title} />;
    }
    return this.props.children;
  }
}
