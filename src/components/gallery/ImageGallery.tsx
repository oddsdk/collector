import React, { useEffect } from 'react';
import {
  // Alert,
  // Button,
  // FlatList,
  // Image,
  // SafeAreaView,
  // ScrollView,
  Text,
  View,
} from 'react-native';

import init from '../../lib/init';

export default function ImageGallery() {
  useEffect(() => {
    console.log('initing')
    init();
  }, []);

  return (
    <View>
      <Text>rendered</Text>
    </View>
  );
}
