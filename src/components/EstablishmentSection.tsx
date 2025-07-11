import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// ✅ ACTUALIZAR: Usar UIIcon en lugar de SVG
import { UIIcon } from './icons/IconSystem';

import { Establishment } from '../services/firestoreService';
import EstablishmentCard from './EstablishmentCard';

const { width } = Dimensions.get('window');

interface EstablishmentSectionProps {
    title: string;
    establishments: Establishment[];
    onEstablishmentPress: (establishmentId: string) => void;
    onSeeAll?: () => void;
    // ✅ AGREGAR: Props para manejar acciones de usuario con valores opcionales
    userFavorites?: string[];
    updatingFavorites?: Set<string>;
    userLikes?: string[];
    updatingLikes?: Set<string>;
    onFavoriteToggle?: (establishmentId: string) => void;
    onLikeToggle?: (establishmentId: string) => void;
}

const EstablishmentSection: React.FC<EstablishmentSectionProps> = ({
    title,
    establishments,
    onEstablishmentPress,
    onSeeAll,
    // ✅ AGREGAR: Destructuring de las nuevas props con defaults
    userFavorites = [],
    updatingFavorites = new Set(),
    userLikes = [],
    updatingLikes = new Set(),
    onFavoriteToggle,
    onLikeToggle
}) => {
    if (!establishments || establishments.length === 0) {
        return null;
    }

    return (
        <View style={styles.section}>
            {/* Header con padding solo a la izquierda */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{title}</Text>
                {onSeeAll && (
                    <TouchableOpacity style={styles.seeAllButton} onPress={onSeeAll}>
                        {/* ✅ REEMPLAZAR: ArrowRightIcon por UIIcon */}
                        <UIIcon
                            name="arrow-right-bg"
                            size={width * 0.05}
                            color="#1A1A2E"
                        />
                    </TouchableOpacity>
                )}
            </View>

            {/* ScrollView que se extiende hasta el borde derecho */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.horizontalScrollView}
                contentContainerStyle={styles.scrollContent}
            >
                {establishments.map((establishment, index) => (
                    <EstablishmentCard
                        key={`${establishment.id}-${index}`}
                        establishment={establishment}
                        onPress={() => onEstablishmentPress(establishment.id)}
                        // ✅ AGREGAR: Pasar props de usuario y acciones con validación
                        isFavorite={userFavorites?.includes(establishment.id) || false}
                        isUpdatingFavorite={updatingFavorites?.has(establishment.id) || false}
                        isLiked={userLikes?.includes(establishment.id) || false}
                        isUpdatingLike={updatingLikes?.has(establishment.id) || false}
                        onFavoriteToggle={onFavoriteToggle ? () => onFavoriteToggle(establishment.id) : undefined}
                        onLikeToggle={onLikeToggle ? () => onLikeToggle(establishment.id) : undefined}
                    />
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    section: {
        marginBottom: width * 0.06,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: width * 0.03,
        // ✅ CAMBIO: Solo padding horizontal para mantener alineación con otros elementos
        paddingHorizontal: width * 0.06,
    },
    sectionTitle: {
        fontSize: width * 0.045,
        fontFamily: 'EuclidSquare-SemiBold',
        color: '#1A1A2E',
    },
    seeAllButton: {
        padding: width * 0.01,
    },
    horizontalScrollView: {
        // Sin padding horizontal - se extiende hasta los bordes
    },
    scrollContent: {
        // ✅ NUEVO: Padding solo al inicio para alinear con otros elementos
        paddingLeft: width * 0.06,
        paddingRight: width * 0.02, // Pequeño padding al final para no tocar completamente el borde
    },
});

export default EstablishmentSection;