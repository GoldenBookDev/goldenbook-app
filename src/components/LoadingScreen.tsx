import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import i18n from '../i18n';

const { width } = Dimensions.get('window');

const LoadingScreen: React.FC = () => {
    return (
        <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>{i18n.t('home.loading')}</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: width * 0.05,
        borderRadius: 8,
    },
    loadingText: {
        fontSize: width * 0.04,
        fontFamily: 'EuclidSquare-Regular',
        color: '#1A1A2E',
    },
});

export default LoadingScreen;