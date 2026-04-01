import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.oichat.app',
    appName: 'OiChat',
    webDir: 'out',
    server: {
        androidScheme: 'https'
    }
};

export default config;
