import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { AppState, Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function ensureAndroidChannels(): Promise<void> {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync('messages', {
    name: 'Messages',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#0D2818',
  });

  await Notifications.setNotificationChannelAsync('matches', {
    name: 'Matches',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#0D2818',
  });

  await Notifications.setNotificationChannelAsync('default', {
    name: 'General',
    importance: Notifications.AndroidImportance.DEFAULT,
    lightColor: '#0D2818',
  });
}

/**
 * Requests notification permission and returns the Expo push token, or null if unavailable.
 */
export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.warn('[notifications] Push tokens require a physical device');
    return null;
  }

  await ensureAndroidChannels();

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;

  const token = await Notifications.getExpoPushTokenAsync(
    projectId ? { projectId } : undefined
  );

  return token.data;
}

export type LocalNotificationKind = 'message' | 'match' | 'general';

function isAppActive(): boolean {
  return AppState.currentState === 'active';
}

/**
 * Shows a local notification when the app is backgrounded.
 */
export async function sendLocalNotification(
  title: string,
  body: string,
  options?: {
    kind?: LocalNotificationKind;
    data?: Record<string, unknown>;
  }
): Promise<void> {
  if (isAppActive()) {
    return;
  }

  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    const { status: requested } = await Notifications.requestPermissionsAsync();
    if (requested !== 'granted') {
      throw new Error('Notification permission not granted');
    }
  }

  await ensureAndroidChannels();

  const kind = options?.kind ?? 'general';
  const channelId =
    Platform.OS === 'android'
      ? kind === 'message'
        ? 'messages'
        : kind === 'match'
          ? 'matches'
          : 'default'
      : undefined;

  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      sound: 'default',
      data: options?.data,
      ...(channelId ? { channelId } : {}),
    },
    trigger: null,
  });
}

export function addNotificationOpenedListener(
  handler: (data: Record<string, unknown> | undefined) => void
): () => void {
  const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
    handler(response.notification.request.content.data);
  });
  return () => subscription.remove();
}
