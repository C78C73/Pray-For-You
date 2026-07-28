import { Platform } from 'react-native';
import { Redirect } from 'expo-router';
import { useAppStore } from '../src/store/useAppStore';

export default function Index() {
  const user = useAppStore((s) => s.user);
  if (!user) return <Redirect href="/welcome" />;
  return <Redirect href={Platform.OS === 'web' ? '/(web)/dashboard' : '/(tabs)'} />;
}
