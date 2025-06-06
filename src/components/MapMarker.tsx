import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { Establishment } from '../services/firestoreService';

// Icons
import BeachIcon from '../assets/images/icons/beach.svg';
import CalendarIcon from '../assets/images/icons/calendar.svg';
import HandsIcon from '../assets/images/icons/hands.svg';
import PeopleIcon from '../assets/images/icons/people.svg';
import PlateIcon from '../assets/images/icons/plate.svg';
import ServicesIcon from '../assets/images/icons/services.svg';
import ShopIcon from '../assets/images/icons/shop.svg';
import SwimmerIcon from '../assets/images/icons/swimmer.svg';

const { width } = Dimensions.get('window');

const iconMapping: { [key: string]: React.FC<any> } = {
    'culture': HandsIcon,
    'gastronomy': PlateIcon,
    'sports': SwimmerIcon,
    'events': CalendarIcon,
    'shops': ShopIcon,
    'beaches': BeachIcon,
    'transport': ServicesIcon,
    'activities': PeopleIcon,
};

// CAMBIO: Colores ahora para bordes en lugar de fondo
const categoryColors = {
    culture: '#9B59B6',
    gastronomy: '#E9A03B',
    sports: '#3B92E9',
    events: '#A73BE9',
    shops: '#D4973D',
    beaches: '#3B92E9',
    transport: '#2ECC71',
    activities: '#E74C3C',
};

interface MapMarkerProps {
    establishment: Establishment;
    isSelected: boolean;
    selectedCategory: string | null;
    onPress: (markerId: string) => void;
}

const MapMarker: React.FC<MapMarkerProps> = ({
    establishment,
    isSelected,
    selectedCategory,
    onPress
}) => {
    // Verificar si debe mostrarse según filtro de categoría
    if (selectedCategory) {
        const hasCategory = establishment.categories && establishment.categories.includes(selectedCategory);
        if (!hasCategory) {
            return null;
        }
    }

    const primaryCategory = establishment.categories && establishment.categories.length > 0
        ? establishment.categories[0]
        : 'gastronomy';

    const CategoryIcon = iconMapping[primaryCategory] || PlateIcon;
    const borderColor = categoryColors[primaryCategory as keyof typeof categoryColors] || '#E9A03B';

    return (
        <Marker
            coordinate={{
                latitude: establishment.coordinates.latitude,
                longitude: establishment.coordinates.longitude
            }}
            onPress={() => onPress(establishment.id)}
        >
            <View style={[
                markerStyles.markerContainer,
                {
                    backgroundColor: 'white',
                    borderColor: categoryColors[primaryCategory as keyof typeof categoryColors] || '#E9A03B'
                },
                isSelected && markerStyles.selectedMarker
            ]}>
                {React.createElement(CategoryIcon, {
                    width: width * 0.04,
                    height: width * 0.04,
                    fill: categoryColors[primaryCategory as keyof typeof categoryColors] || '#E9A03B'
                })}
            </View>
        </Marker>
    );
};

const markerStyles = StyleSheet.create({
    markerContainer: {
        width: width * 0.08,
        height: width * 0.08,
        borderRadius: width * 0.04,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        borderWidth: 2.5,
        borderColor: 'white',
    },
    selectedMarker: {
        width: width * 0.09,
        height: width * 0.09,
        borderRadius: width * 0.045,
        borderWidth: 3,
        borderColor: 'white',
    },
});

export default MapMarker;