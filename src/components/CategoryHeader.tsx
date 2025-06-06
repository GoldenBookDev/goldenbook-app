import React from 'react';
import {
    Dimensions,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ArrowLeftIcon from '../assets/images/icons/arrow-left-bg.svg';

const { width } = Dimensions.get('window');

interface CategoryHeaderProps {
    locationName: string;
    onBack: () => void;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({ locationName, onBack }) => {
    return (
        <>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
            <SafeAreaView style={styles.safeHeaderContainer} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={onBack}>
                        <ArrowLeftIcon width={width * 0.1} height={width * 0.1} />
                    </TouchableOpacity>
                    <Text style={styles.locationText}>{locationName}, Portugal</Text>
                </View>
            </SafeAreaView>
        </>
    );
};
const styles = StyleSheet.create({
    safeHeaderContainer: {
        backgroundColor: 'white',
        zIndex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: width * 0.04,
        paddingVertical: width * 0.03,
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    backButton: {
        width: width * 0.1,
        height: width * 0.1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    locationText: {
        fontSize: width * 0.04,
        fontFamily: 'EuclidSquare-Regular',
        color: '#666',
        marginLeft: width * 0.03,
    },
});

export default CategoryHeader;