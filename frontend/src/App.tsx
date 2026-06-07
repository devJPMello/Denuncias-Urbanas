import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ErrorBoundary } from 'react-error-boundary';
import { useAdminAuth } from './lib/auth';
import { SplashScreen }            from './components/screens/SplashScreen';
import { AdminLoginScreen,
         AdminChangePasswordScreen } from './components/screens/LoginScreen';
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

// ── Admin route guard ─────────────────────────────────────────────────────────

function AdminRoute() {
  const { isAuthenticated, mustChangePassword, logout } = useAdminAuth();
  const navigate = useNavigate();

  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  if (mustChangePassword) return <Navigate to="/admin/change-password" replace />;

  return <AdminPanelScreen onLogout={() => { logout(); navigate('/admin/login', { replace: true }); }} />;
}

// ── Route components ──────────────────────────────────────────────────────────

function SplashRoute() {
  const navigate = useNavigate();
  return (
    <SplashScreen
      onLogin={() => navigate('/map')}
      onRegister={() => navigate('/map')}
      onAdmin={() => navigate('/admin/login')}
    />
  );
}

function AdminLoginRoute() {
  const navigate = useNavigate();
  const { isAuthenticated, mustChangePassword } = useAdminAuth();

  useEffect(() => {
    if (isAuthenticated && !mustChangePassword) navigate('/admin', { replace: true });
    if (isAuthenticated && mustChangePassword) navigate('/admin/change-password', { replace: true });
  }, [isAuthenticated, mustChangePassword, navigate]);

  return (
    <AdminLoginScreen
      onBack={() => navigate('/splash')}
      onLogin={() => {
        /* handled by useEffect above */
      }}
    />
  );
}

function AdminChangePasswordRoute() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAdminAuth();
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return <AdminChangePasswordScreen onSuccess={() => navigate('/admin', { replace: true })} />;
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

function ProfileRoute() {
  const navigate = useNavigate();
  return (
    <ProfileScreen
      onBack={() => navigate('/map')}
      onSettingClick={(type) => navigate(`/settings/${type}`)}
      onStatsClick={() => navigate('/user-stats')}
      onAdminPanel={() => navigate('/admin/login')}
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
          <Route path="/"                       element={<Navigate to="/map" replace />} />
          <Route path="/splash"                 element={<SplashRoute />} />
          <Route path="/map"                    element={<MapRoute />} />
          <Route path="/my-reports"             element={<MyReportsRoute />} />
          <Route path="/report/:id"             element={<ReportDetailRoute />} />
          <Route path="/admin"                  element={<AdminRoute />} />
          <Route path="/admin/login"            element={<AdminLoginRoute />} />
          <Route path="/admin/change-password" element={<AdminChangePasswordRoute />} />
          <Route path="/profile"                element={<ProfileRoute />} />
          <Route path="/settings/:type"         element={<SettingsRoute />} />
          <Route path="/user-stats"             element={<UserStatsRoute />} />
          <Route path="*"                       element={<Navigate to="/map" replace />} />
        </Routes>
      </ErrorBoundary>
      <UpdatePrompt />
      <ConnectionStatus />
      <InstallPWAPrompt />
    </div>
  );
}
