import './src/importPolyfills'
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import PolyfillCrypto from 'react-native-webview-crypto';

import ImageGallery from './src/components/gallery/ImageGallery';

export default function App() {
  return (
    <>
      <View className="flex items-center justify-center bg-white p-8">
        <Text>Open up App.tsx tooooooo start working on your app!</Text>
        <StatusBar style="auto" />
      </View>
      <PolyfillCrypto />
      <ImageGallery />
    </>
  );
}
