import React from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { Establishment } from '../services/firestoreService';

// ✅ NUEVO: Import del sistema de iconos
import { CategoryIcon } from '../components/icons/IconSystem';

const { width } = Dimensions.get('window');

// ✅ ELIMINADO: iconMapping ya no es necesario porque CategoryIcon maneja esto internamente

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
                {/* ✅ REEMPLAZADO: CategoryIcon component sin el fondo de gota */}
                <View style={markerStyles.iconContainer}>
                    <CategoryIcon
                        category={primaryCategory}
                        type="category"
                        size={width * 0.06} // Tamaño del contenedor del icono
                        iconSize={width * 0.035} // Tamaño del icono en sí
                        iconColor={categoryColors[primaryCategory as keyof typeof categoryColors] || '#E9A03B'}
                        backgroundColor="transparent" // ✅ Sin fondo de gota para el mapa
                    />
                </View>
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
    // ✅ NUEVO: Contenedor para el icono sin fondo
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default MapMarker;