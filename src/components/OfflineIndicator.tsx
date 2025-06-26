import React from 'react';
import {
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

const { width } = Dimensions.get('window');

interface OfflineIndicatorProps {
    style?: any;
    showWhenOnline?: boolean;
}

const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
    style,
    showWhenOnline = false
}) => {
    const { isConnected } = useNetworkStatus();
    const [fadeAnim] = React.useState(new Animated.Value(0));

    React.useEffect(() => {
        if (!isConnected || showWhenOnline) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            Animated.timing(fadeAnim, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }).start();
        }
    }, [isConnected, showWhenOnline]);

    if (isConnected && !showWhenOnline) {
        return null;
    }

    return (
        <Animated.View style={[
            styles.container,
            !isConnected ? styles.offline : styles.online,
            { opacity: fadeAnim },
            style
        ]}>
            <View style={styles.content}>
                <View style={[
                    styles.indicator,
                    !isConnected ? styles.indicatorOffline : styles.indicatorOnline
                ]} />
                <Text style={[
                    styles.text,
                    !isConnected ? styles.textOffline : styles.textOnline
                ]}>
                    {isConnected ? 'Online' : 'Modo Offline'}
                </Text>
            </View>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: width * 0.04,
        paddingVertical: width * 0.02,
        marginVertical: width * 0.01,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: width * 0.015,
        paddingHorizontal: width * 0.03,
        borderRadius: width * 0.02,
    },
    offline: {
        backgroundColor: 'rgba(255, 152, 0, 0.1)',
    },
    online: {
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
    },
    indicator: {
        width: width * 0.02,
        height: width * 0.02,
        borderRadius: width * 0.01,
        marginRight: width * 0.02,
    },
    indicatorOffline: {
        backgroundColor: '#FF9800',
    },
    indicatorOnline: {
        backgroundColor: '#4CAF50',
    },
    text: {
        fontSize: width * 0.032,
        fontFamily: 'EuclidSquare-Medium',
    },
    textOffline: {
        color: '#FF9800',
    },
    textOnline: {
        color: '#4CAF50',
    },
});

export default OfflineIndicator;