import { useState, useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useAppAuth } from './lib/auth';
import { useMe } from './hooks/api/useMe';
import { SplashScreen }      from './components/screens/SplashScreen';
import { LoginScreen }       from './components/screens/LoginScreen';
import { MapScreen }         from './components/screens/MapScreen';
import { MyReportsScreen }   from './components/screens/MyReportsScreen';
import { ReportDetailScreen } from './components/screens/ReportDetailScreen';
import { AdminPanelScreen }  from './components/screens/AdminPanelScreen';
import { ProfileScreen }     from './components/screens/ProfileScreen';
import { SettingsScreen }    from './components/screens/SettingsScreen';
import { UserStatsScreen }   from './components/screens/UserStatsScreen';
import { UpdatePrompt }      from './components/UpdatePrompt';
import { ConnectionStatus }  from './components/ConnectionStatus';
import { InstallPWAPrompt }  from './components/InstallPWAPrompt';
import { ErrorFallback }     from './components/ErrorFallback';

type Screen = 'splash' | 'login' | 'map' | 'my-reports' | 'report-detail' | 'admin' | 'profile' | 'settings' | 'user-stats';
type SettingType = 'notifications' | 'language' | 'help';

export default function App() {
  const [currentScreen, setCurrentScreen]       = useState<Screen>('splash');
  const [settingType, setSettingType]           = useState<SettingType>('notifications');
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const { isSignedIn, isLoaded } = useAppAuth();
  const { isAdmin }              = useMe();

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn && (currentScreen === 'splash' || currentScreen === 'login')) {
      setCurrentScreen('map');
    }
  }, [isLoaded, isSignedIn]);

  const navigateToDetail = (id: string) => {
    setSelectedReportId(id);
    setCurrentScreen('report-detail');
  };

  /** Acesso direto ao painel — sem restrição de login. */
  const handleAdminAccess = () => {
    setCurrentScreen('admin');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return (
          <SplashScreen
            onLogin={() => setCurrentScreen('login')}
            onRegister={() => setCurrentScreen('login')}
            onAdmin={handleAdminAccess}
          />
        );
      case 'login':
        return (
          <LoginScreen
            onBack={() => setCurrentScreen('splash')}
            onLogin={() => setCurrentScreen('map')}
            onAnonymous={() => setCurrentScreen('map')}
          />
        );
      case 'map':
        return (
          <MapScreen
            onNewReport={() => setCurrentScreen('map')}
            onMyReports={() => setCurrentScreen('my-reports')}
            onProfile={() => setCurrentScreen('profile')}
          />
        );
      case 'profile':
        return (
          <ProfileScreen
            onBack={() => setCurrentScreen('map')}
            onSettingClick={(type) => {
              setSettingType(type);
              setCurrentScreen('settings');
            }}
            onStatsClick={() => setCurrentScreen('user-stats')}
            onLogout={() => setCurrentScreen('splash')}
          />
        );
      case 'user-stats':
        return <UserStatsScreen onBack={() => setCurrentScreen('profile')} />;
      case 'settings':
        return <SettingsScreen onBack={() => setCurrentScreen('profile')} settingType={settingType} />;
      case 'my-reports':
        return (
          <MyReportsScreen
            onBack={() => setCurrentScreen('map')}
            onReportClick={navigateToDetail}
          />
        );
      case 'report-detail':
        return (
          <ReportDetailScreen
            reportId={selectedReportId}
            onBack={() => setCurrentScreen('my-reports')}
          />
        );
      case 'admin':
        return <AdminPanelScreen onLogout={() => setCurrentScreen('login')} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-screen h-screen bg-background overflow-hidden">
      <ErrorBoundary
        FallbackComponent={ErrorFallback}
        onReset={() => setCurrentScreen('map')}
      >
        {renderScreen()}
      </ErrorBoundary>
      <UpdatePrompt />
      <ConnectionStatus />
      <InstallPWAPrompt />
    </div>
  );
}
