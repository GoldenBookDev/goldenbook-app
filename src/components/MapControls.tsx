import React from 'react';
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native';

import LocationIcon from '../assets/images/icons/location.svg';
import MinusIcon from '../assets/images/icons/minus.svg';
import PlusIcon from '../assets/images/icons/plus.svg';

const { width } = Dimensions.get('window');

interface MapControlsProps {
    onZoomIn: () => void;
    onZoomOut: () => void;
    onCenterLocation: () => void;
}

const MapControls: React.FC<MapControlsProps> = ({
    onZoomIn,
    onZoomOut,
    onCenterLocation
}) => {
    return (
        <View style={controlsStyles.zoomControlsContainer}>
            <TouchableOpacity style={controlsStyles.zoomButton} onPress={onZoomIn}>
                <PlusIcon width={width * 0.05} height={width * 0.05} />
            </TouchableOpacity>
            <TouchableOpacity style={controlsStyles.zoomButton} onPress={onZoomOut}>
                <MinusIcon width={width * 0.05} height={width * 0.05} />
            </TouchableOpacity>
            <TouchableOpacity style={controlsStyles.locationButton} onPress={onCenterLocation}>
                <LocationIcon width={width * 0.05} height={width * 0.05} fill="#FFFFFF" />
            </TouchableOpacity>
        </View>
    );
};

const controlsStyles = StyleSheet.create({
    zoomControlsContainer: {
        position: 'absolute',
        right: width * 0.04,
        bottom: width * 0.35,
        alignItems: 'center',
        zIndex: 5,
    },
    zoomButton: {
        width: width * 0.1,
        height: width * 0.1,
        backgroundColor: 'white',
        borderRadius: width * 0.05,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: width * 0.02,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    locationButton: {
        width: width * 0.1,
        height: width * 0.1,
        backgroundColor: '#1A1A2E',
        borderRadius: width * 0.05,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: width * 0.02,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});

export default MapControls;
