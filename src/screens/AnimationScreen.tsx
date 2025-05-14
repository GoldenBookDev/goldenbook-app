import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import LottieAnimation from '@components/LottieAnimation';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '@navigation/navigationTypes';

type AnimationScreenProps = NativeStackScreenProps<RootStackParamList, 'AnimationScreen'>;

const { width, height } = Dimensions.get('screen'); // Obtiene las dimensiones de la pantalla
console.log( width, height)

const AnimationScreen: React.FC<AnimationScreenProps> = ({ navigation }) => {
  useEffect(() => {
    const timeout = setTimeout(() => {
      navigation.replace('OnboardingScreen'); // Navega a OnboardingScreen después de 3 segundos
    }, 3700);

    return () => clearTimeout(timeout);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <LottieAnimation
        iosSource={require('../assets/animations/animation-ios.json')}
        androidSource={require('../assets/animations/animation-android.json')}
        style={styles.animation}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#223E58',
  },
  animation: {
    width: width,
    height: height, 
  },
});

export default AnimationScreen;
