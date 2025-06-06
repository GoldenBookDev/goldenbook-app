import React from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import ArrowLeftIcon from '../assets/images/icons/arrow-left-bg.svg';

const { width } = Dimensions.get('window');

interface ScreenHeaderProps {
    title: string;
    onBack: () => void;
    rightComponent?: React.ReactNode;
}

const ScreenHeader: React.FC<ScreenHeaderProps> = ({ title, onBack, rightComponent }) => {
    return (
        <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
                <ArrowLeftIcon width={width * 0.08} height={width * 0.08} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{title}</Text>
            <View style={styles.headerRight}>
                {rightComponent}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: width * 0.04,
        paddingVertical: width * 0.04,
        backgroundColor: '#FFFFFF',
        borderBottomColor: '#F0F0F0',
        borderBottomWidth: 1,
    },
    backButton: {
        padding: width * 0.02,
    },
    headerTitle: {
        fontSize: width * 0.05,
        fontFamily: 'EuclidSquare-SemiBold',
        color: '#1A1A2E',
    },
    headerRight: {
        width: width * 0.08,
    },
});

export default ScreenHeader;