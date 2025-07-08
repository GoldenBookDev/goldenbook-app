import React from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import i18n from '../i18n';

const { width } = Dimensions.get('window');

interface EstablishmentsFilterProps {
    selectedFilter: string;
    onFilterSelect: (filter: string) => void;
    shouldShowNearMe?: boolean; // ✅ Nueva prop para controlar si mostrar "Near Me"
}

const EstablishmentsFilter: React.FC<EstablishmentsFilterProps> = ({
    selectedFilter,
    onFilterSelect,
    shouldShowNearMe = false // ✅ Por defecto no mostrar
}) => {
    // ✅ Crear lista de filtros dinámicamente basado en shouldShowNearMe
    const baseFilters = [
        { key: 'recommended', label: i18n.t('category.recommended') },
        { key: 'open_now', label: i18n.t('category.openNow') },
        { key: 'most_liked', label: i18n.t('category.mostLiked') }
    ];

    // ✅ Solo agregar "Near Me" si shouldShowNearMe es true
    const filters = shouldShowNearMe
        ? [
            ...baseFilters.slice(0, 2), // recommended, open_now
            { key: 'near_me', label: i18n.t('category.nearMe') }, // Insertar en posición 3
            ...baseFilters.slice(2) // most_liked
        ]
        : baseFilters; // Sin near_me

    return (
        <View style={styles.filterSection}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterContainer}
                keyboardShouldPersistTaps="handled"
            >
                {filters.map((filter) => {
                    // ✅ CAMBIO: Solo seleccionar si hay un filtro activo Y coincide
                    const isSelected = selectedFilter === filter.key && selectedFilter !== '';

                    return (
                        <TouchableOpacity
                            key={filter.key}
                            style={[
                                styles.filterButton,
                                isSelected && styles.filterButtonSelected
                            ]}
                            onPress={() => {
                                // ✅ CAMBIO: Si ya está seleccionado, deseleccionar ('')
                                // Si no está seleccionado, seleccionar
                                onFilterSelect(isSelected ? '' : filter.key);
                            }}
                        >
                            <Text style={[
                                styles.filterText,
                                isSelected && styles.filterTextSelected
                            ]}>
                                {filter.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    filterSection: {
        backgroundColor: 'white',
        paddingTop: width * 0.005, // ✅ REDUCIDO: Menos padding superior (era 0.02)
        paddingBottom: width * 0.015, // ✅ REDUCIDO: Menos padding inferior (era 0.02)
        marginTop: -width * 0.01, // ✅ AGREGAR: Margen negativo para acercarlo más al título
    },
    filterContainer: {
        paddingHorizontal: width * 0.04,
        alignItems: 'center',
    },
    filterButton: {
        backgroundColor: '#F8F9FA', // ✅ Fondo por defecto (no seleccionado)
        paddingHorizontal: width * 0.04,
        paddingVertical: width * 0.025,
        borderRadius: width * 0.05, // ✅ Globo redondeado
        marginRight: width * 0.03,
        // ✅ SIN borderWidth según maqueta
    },
    filterButtonSelected: {
        backgroundColor: '#EAEAEA', // ✅ Fondo cuando está seleccionado
    },
    filterText: {
        fontSize: width * 0.033,
        fontFamily: 'EuclidSquare-Medium',
        color: '#333', // ✅ Color por defecto (no seleccionado)
        textAlign: 'center',
    },
    filterTextSelected: {
        fontFamily: 'EuclidSquare-SemiBold',
    },
});

export default EstablishmentsFilter;