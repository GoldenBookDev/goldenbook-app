import React from 'react';
import {
    Dimensions,
    Platform,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ArrowLeftIcon from '../assets/images/icons/arrow-left-bg.svg';
import FilterIcon from '../assets/images/icons/filter.svg';

const { width } = Dimensions.get('window');

interface MapHeaderProps {
    locationName: string;
    onBack: () => void;
}

const MapHeader: React.FC<MapHeaderProps> = ({ locationName, onBack }) => {
    return (
        <SafeAreaView style={mapHeaderStyles.safeArea} edges={['right', 'left']}>
            <View style={mapHeaderStyles.header}>
                <TouchableOpacity style={mapHeaderStyles.backButton} onPress={onBack}>
                    <ArrowLeftIcon width={width * 0.1} height={width * 0.1} />
                </TouchableOpacity>
                <Text style={mapHeaderStyles.headerTitle}>{locationName}</Text>
                <TouchableOpacity style={mapHeaderStyles.filterButton}>
                    <FilterIcon width={width * 0.06} height={width * 0.06} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const mapHeaderStyles = StyleSheet.create({
    safeArea: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
        backgroundColor: 'white',
        zIndex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'android' ? 10 : 50,
        paddingHorizontal: width * 0.04,
        paddingBottom: width * 0.04,
        backgroundColor: 'white',
    },
    backButton: {
        width: width * 0.1,
        height: width * 0.1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: width * 0.045,
        fontFamily: 'EuclidSquare-SemiBold',
        color: '#1A1A2E',
    },
    filterButton: {
        width: width * 0.1,
        height: width * 0.1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default MapHeader;
