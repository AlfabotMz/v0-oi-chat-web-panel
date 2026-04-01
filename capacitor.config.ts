import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
    appId: 'com.oichat.app',
    appName: 'OiChat',
    webDir: 'out',
    server: {
        url: 'https://myoichat.online',
        cleartext: true
    }
};

export default config;
