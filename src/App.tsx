import { lazy, Suspense, useEffect, useState } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { LoadingScreen } from './components/LoadingScreen';
import { ScreenTransition } from './components/ScreenTransition';
import { ProgressProvider } from './engine/progress';
import { parseHash, routeToHash, type Route } from './engine/routing';

const StartScreen = lazy(() =>
  import('./screens/StartScreen').then((m) => ({ default: m.StartScreen })),
);
const AvatarCreator = lazy(() =>
  import('./screens/AvatarCreator').then((m) => ({ default: m.AvatarCreator })),
);
const MapScreen = lazy(() =>
  import('./screens/MapScreen').then((m) => ({ default: m.MapScreen })),
);
const ThemeHome = lazy(() =>
  import('./screens/ThemeHome').then((m) => ({ default: m.ThemeHome })),
);
const ActivityScreen = lazy(() =>
  import('./screens/ActivityScreen').then((m) => ({ default: m.ActivityScreen })),
);
const StickerBook = lazy(() =>
  import('./screens/StickerBook').then((m) => ({ default: m.StickerBook })),
);
const ParentsArea = lazy(() =>
  import('./screens/ParentsArea').then((m) => ({ default: m.ParentsArea })),
);
const DevScreen = lazy(() =>
  import('./screens/DevScreen').then((m) => ({ default: m.DevScreen })),
);

function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', onHashChange);

    if (!window.location.hash) {
      window.location.hash = '#start';
    }

    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  return route;
}

function ScreenRouter({ route }: { route: Route }) {
  switch (route.name) {
    case 'start':
      return <StartScreen />;
    case 'avatar':
      return <AvatarCreator />;
    case 'map':
      return <MapScreen />;
    case 'stickers':
      return <StickerBook />;
    case 'parents':
      return <ParentsArea />;
    case 'dev':
      return <DevScreen />;
    case 'theme':
      return <ThemeHome themeId={route.themeId} />;
    case 'activity':
      return <ActivityScreen themeId={route.themeId} activityId={route.activityId} />;
  }
}

function RouteFallback() {
  return (
    <div className="screen" aria-busy="true">
      <p>載入畫面…</p>
    </div>
  );
}

function AppShell() {
  const route = useHashRoute();
  const [tipDismissed, setTipDismissed] = useState(false);
  const routeKey = routeToHash(route);

  return (
    <div className="app-shell">
      <Suspense fallback={<RouteFallback />}>
        <ScreenTransition routeKey={routeKey}>
          <ScreenRouter route={route} />
        </ScreenTransition>
      </Suspense>

      <div
        className={`orientation-tip${tipDismissed ? ' dismissed' : ''}`}
        role="dialog"
        aria-label="請轉為橫向"
      >
        <p>請將平板轉為橫向，體驗會更好喔！</p>
        <button type="button" onClick={() => setTipDismissed(true)}>
          繼續使用
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ProgressProvider>
        <LoadingScreen />
        <AppShell />
      </ProgressProvider>
    </ErrorBoundary>
  );
}
