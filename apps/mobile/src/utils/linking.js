import * as Linking from 'expo-linking';

const prefix = Linking.createURL('/');

const config = {
  screens: {
    // Auth Stack
    Login: 'login',
    
    // Main Stack (conditionally rendered)
    WorkerDashboard: 'dashboard',
    Jobs: 'jobs',
    JobDetail: 'jobs/:jobId', // Deep link: assemblytracker://jobs/123
    ExpenseManagement: 'expenses',
    
    ManagerDashboard: 'manager',
    TeamList: 'team',
    JobAssignment: 'assign',
    CostManagement: 'costs',
    
    AdminDashboard: 'admin',
    UserManagement: 'users',
    CustomerManagement: 'customers',
    Approvals: 'approvals',
    CreateJob: 'create-job',
    
    Profile: 'profile',
    Notifications: 'notifications',
    Chat: 'chat/:jobId', // Deep link: assemblytracker://chat/123
  },
};

export const linking = {
  prefixes: [prefix, 'assemblytracker://'],
  config,
  async getInitialURL() {
    // First, you may want to do the default deep link handling
    // Check if app was opened from a deep link
    const url = await Linking.getInitialURL();

    if (url != null) {
      return url;
    }

    // Handle notification interaction (when user taps on a notification)
    // This part is handled by the notification response listener in App.js or hooks
    // but can be integrated here if needed.
    
    return null;
  },
  subscribe(listener) {
    const onReceiveURL = ({ url }) => listener(url);

    // Listen to incoming links from deep linking
    const eventListenerSubscription = Linking.addEventListener('url', onReceiveURL);

    return () => {
      // Clean up the event listener
      eventListenerSubscription.remove();
    };
  },
};
