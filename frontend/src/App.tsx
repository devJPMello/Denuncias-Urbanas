import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { useAppAuth } from './lib/auth';
import { SplashScreen }       from './components/screens/SplashScreen';
import { LoginScreen }        from './components/screens/LoginScreen';
import { MapScreen }          from './components/screens/MapScreen';
import { MyReportsScreen }    from './components/screens/MyReportsScreen';
import { ReportDetailScreen } from './components/screens/ReportDetailScreen';
import { AdminPanelScreen }   from './components/screens/AdminPanelScreen';
import { ProfileScreen }      from './components/screens/ProfileScreen';
import { SettingsScreen }     from './components/screens/SettingsScreen';
import { UserStatsScreen }    from './components/screens/UserStatsScreen';
import { UpdatePrompt }       from './components/UpdatePrompt';
import { ConnectionStatus }   from './components/ConnectionStatus';
import { InstallPWAPrompt }   from './components/InstallPWAPrompt';
import { ErrorFallback }      from './components/ErrorFallback';

type SettingType = 'notifications' | 'language' | 'help';

// ── Auth-aware root redirect ──────────────────────────────────────────────────

function RootRedirect() {
  const { isSignedIn, isLoaded } = useAppAuth();
  if (!isLoaded) return null;
  return <Navigate to={isSignedIn ? '/map' : '/splash'} replace />;
}

// ── Route components ──────────────────────────────────────────────────────────

function SplashRoute() {
  const navigate = useNavigate();
  const { isSignedIn, isLoaded } = useAppAuth();

  useEffect(() => {
    if (isLoaded && isSignedIn) navigate('/map', { replace: true });
  }, [isLoaded, isSignedIn, navigate]);

  return (
    <SplashScreen
      onLogin={() => navigate('/login')}
      onRegister={() => navigate('/login')}
      onAdmin={() => navigate('/admin')}
    />
  );
}

function LoginRoute() {
  const navigate = useNavigate();
  return (
    <LoginScreen
      onBack={() => navigate('/splash')}
      onLogin={() => navigate('/map', { replace: true })}
      onAnonymous={() => navigate('/map', { replace: true })}
    />
  );
}

function MapRoute() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const autoOpen = searchParams.get('action') === 'new-report';

  useEffect(() => {
    if (autoOpen) setSearchParams({}, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <MapScreen
      onNewReport={() => {}}
      onMyReports={() => navigate('/my-reports')}
      onProfile={() => navigate('/profile')}
      autoOpenNewReport={autoOpen}
    />
  );
}

function MyReportsRoute() {
  const navigate = useNavigate();
  return (
    <MyReportsScreen
      onBack={() => navigate('/map')}
      onReportClick={(id) => navigate(`/report/${id}`)}
    />
  );
}

function ReportDetailRoute() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  return (
    <ReportDetailScreen
      reportId={id ?? null}
      onBack={() => navigate('/my-reports')}
    />
  );
}

function AdminRoute() {
  const navigate = useNavigate();
  return <AdminPanelScreen onLogout={() => navigate('/login')} />;
}

function ProfileRoute() {
  const navigate = useNavigate();
  return (
    <ProfileScreen
      onBack={() => navigate('/map')}
      onSettingClick={(type) => navigate(`/settings/${type}`)}
      onStatsClick={() => navigate('/user-stats')}
      onLogout={() => navigate('/splash')}
    />
  );
}

function SettingsRoute() {
  const navigate = useNavigate();
  const { type } = useParams<{ type: string }>();
  return (
    <SettingsScreen
      onBack={() => navigate('/profile')}
      settingType={(type as SettingType) ?? 'notifications'}
    />
  );
}

function UserStatsRoute() {
  const navigate = useNavigate();
  return <UserStatsScreen onBack={() => navigate('/profile')} />;
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <div className="w-screen h-screen bg-background overflow-hidden">
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() => window.location.replace('/')}
      >
        <Routes>
          <Route path="/"               element={<RootRedirect />} />
          <Route path="/splash"         element={<SplashRoute />} />
          <Route path="/login"          element={<LoginRoute />} />
          <Route path="/map"            element={<MapRoute />} />
          <Route path="/my-reports"     element={<MyReportsRoute />} />
          <Route path="/report/:id"     element={<ReportDetailRoute />} />
          <Route path="/admin"          element={<AdminRoute />} />
          <Route path="/profile"        element={<ProfileRoute />} />
          <Route path="/settings/:type" element={<SettingsRoute />} />
          <Route path="/user-stats"     element={<UserStatsRoute />} />
          <Route path="*"               element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
      <UpdatePrompt />
      <ConnectionStatus />
      <InstallPWAPrompt />
    </div>
  );
}
