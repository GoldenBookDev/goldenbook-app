import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import LottieView, { AnimationObject } from 'lottie-react-native';

interface LottieAnimationProps {
  iosSource: AnimationObject | { uri: string };
  androidSource: AnimationObject | { uri: string };
  loop?: boolean;
  autoPlay?: boolean;
  style?: object;
}

const LottieAnimation: React.FC<LottieAnimationProps> = ({
  iosSource,
  androidSource,
  loop = true,
  autoPlay = true,
  style,
}) => {
  const source = Platform.OS === 'ios' ? iosSource : androidSource;

  return (
    <LottieView
      source={source}
      autoPlay={autoPlay}
      loop={loop}
      style={[styles.animation, style]} // Aseguramos que se aplique flex y estilos personalizados
    />
  );
};

const styles = StyleSheet.create({
  animation: {
    width: '100%',
    height: '100%', // Asegura que ocupe el 100% del espacio del contenedor
    alignSelf: 'center',
  },
});

export default LottieAnimation;
