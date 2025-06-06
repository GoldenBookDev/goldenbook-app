import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity } from 'react-native';
import LandLayerLocationIcon from '../assets/images/icons/land-layer-location.svg';
import i18n from '../i18n';

const { width } = Dimensions.get('window');

interface FloatingMapButtonProps {
    onPress: () => void;
}

const FloatingMapButton: React.FC<FloatingMapButtonProps> = ({ onPress }) => {
    return (
        <TouchableOpacity style={mapButtonStyles.floatingMapButton} onPress={onPress}>
            <LandLayerLocationIcon
                width={width * 0.045}
                height={width * 0.045}
                fill="#FFFFFF"
                style={{ marginRight: width * 0.02 }}
            />
            <Text style={mapButtonStyles.floatingMapButtonText}>
                {i18n.t('category.seeMap')}
            </Text>
        </TouchableOpacity>
    );
};

const mapButtonStyles = StyleSheet.create({
    floatingMapButton: {
        position: 'absolute',
        bottom: width * 0.30,
        alignSelf: 'center',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#00B383',
        paddingVertical: width * 0.030,
        paddingHorizontal: width * 0.07,
        borderRadius: 10,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    floatingMapButtonText: {
        color: '#FFFFFF',
        fontSize: width * 0.035,
        fontFamily: 'EuclidSquare-Medium',
    },
});

export default FloatingMapButton;