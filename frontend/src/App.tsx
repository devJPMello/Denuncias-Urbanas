import { useState } from 'react';
import { SplashScreen } from './components/screens/SplashScreen';
import { LoginScreen } from './components/screens/LoginScreen';
import { MapScreen } from './components/screens/MapScreen';
import { MyReportsScreen } from './components/screens/MyReportsScreen';
import { ReportDetailScreen } from './components/screens/ReportDetailScreen';
import { AdminPanelScreen } from './components/screens/AdminPanelScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { UserStatsScreen } from './components/screens/UserStatsScreen';

type Screen = 'splash' | 'login' | 'map' | 'my-reports' | 'report-detail' | 'admin' | 'profile' | 'settings' | 'user-stats';
type SettingType = 'notifications' | 'language' | 'help';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('splash');
  const [settingType, setSettingType] = useState<SettingType>('notifications');

  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return (
          <SplashScreen
            onLogin={() => setCurrentScreen('login')}
            onRegister={() => setCurrentScreen('login')}
            onAdmin={() => setCurrentScreen('admin')}
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
            onReportClick={() => setCurrentScreen('report-detail')}
          />
        );
      case 'report-detail':
        return <ReportDetailScreen onBack={() => setCurrentScreen('my-reports')} />;
      case 'admin':
        return <AdminPanelScreen onLogout={() => setCurrentScreen('login')} />;
      default:
        return null;
    }
  };

  return (
    <div className="w-screen h-screen bg-background overflow-hidden">
      {renderScreen()}
    </div>
  );
}
