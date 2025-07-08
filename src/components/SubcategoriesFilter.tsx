import React from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// Import del sistema de iconos actualizado
import { CategoryIcon } from './icons/IconSystem';

const { width } = Dimensions.get('window');

interface SubcategoryData {
    id: string;
    title: string;
}

interface SubcategoriesFilterProps {
    subcategories: SubcategoryData[];
    selectedSubcategory: string | null;
    onSubcategorySelect: (subcategoryId: string | null) => void;
    getTranslatedSubcategory: (subcategoryKey: string) => string;
}

const SubcategoriesFilter: React.FC<SubcategoriesFilterProps> = ({
    subcategories,
    selectedSubcategory,
    onSubcategorySelect,
    getTranslatedSubcategory
}) => {
    if (subcategories.length === 0) return null;

    return (
        <View style={subStyles.subcategoriesSection}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={subStyles.subcategoriesContainer}
                keyboardShouldPersistTaps="handled"
                removeClippedSubviews={true}
            >
                {subcategories.map((item) => {
                    const isSelected = selectedSubcategory === item.id;

                    return (
                        <TouchableOpacity
                            key={item.id}
                            style={[
                                subStyles.subcategoryItem,
                                isSelected && subStyles.subcategoryItemActive
                            ]}
                            onPress={() => onSubcategorySelect(isSelected ? null : item.id)}
                        >
                            {/* ✅ CategoryIcon MÁS GRANDE según maqueta */}
                            <CategoryIcon
                                category={item.id}
                                type="subcategory"
                                size={width * 0.18} // ✅ MÁS GRANDE (era 0.15)
                                iconSize={width * 0.08} // ✅ Icono MÁS GRANDE (era 0.07)
                                iconColor={isSelected ? '#915A17' : '#915A17'} // ✅ Color correcto
                                backgroundColor={isSelected ? '#F0E6D2' : '#F8EDD2'}
                                style={subStyles.iconContainer}
                            />

                            {/* ✅ TEXTO CON ALTURA FIJA (2 líneas siempre) */}
                            <View style={subStyles.textContainer}>
                                <Text
                                    style={[
                                        subStyles.subcategoryText,
                                        isSelected && subStyles.subcategoryTextActive
                                    ]}
                                    numberOfLines={2} // ✅ Máximo 2 líneas
                                    adjustsFontSizeToFit={false} // ✅ No reducir tamaño
                                    ellipsizeMode="tail" // ✅ Puntos al final si es muy largo
                                >
                                    {getTranslatedSubcategory(item.id)}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const subStyles = StyleSheet.create({
    subcategoriesSection: {
        backgroundColor: 'white',
        paddingBottom: width * 0.01, // ✅ Menos espacio abajo
        // ✅ QUITAR borderBottomWidth y borderBottomColor
    },
    subcategoriesContainer: {
        paddingHorizontal: width * 0.015, // ✅ Menos padding para más espacio
        paddingTop: width * 0.015, // ✅ Menos espacio arriba (era 0.01)
        paddingBottom: width * 0.005, // ✅ Menos espacio abajo
        alignItems: 'flex-start',
    },
    subcategoryItem: {
        alignItems: 'center',
        marginHorizontal: width * 0.01, // ✅ Menos margin para más espacio
        padding: width * 0.015,
        width: width * 0.25, // ✅ Aún más ancho para palabras largas
    },
    subcategoryItemActive: {
        backgroundColor: 'rgba(153, 123, 65, 0.1)',
        borderRadius: 8,
    },
    iconContainer: {
        marginBottom: width * 0.02,
    },
    // ✅ CONTENEDOR DE TEXTO CON ALTURA FIJA
    textContainer: {
        height: width * 0.09, // ✅ Altura fija para 2 líneas (un poco más)
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    subcategoryText: {
        fontSize: width * 0.031, // ✅ Ligeramente más pequeño para que quepa
        fontFamily: 'EuclidSquare-Medium',
        color: '#333',
        textAlign: 'center',
        lineHeight: width * 0.038, // ✅ Altura de línea ajustada
        maxWidth: '100%',
        flexWrap: 'wrap', // ✅ Permitir salto de línea
    },
    subcategoryTextActive: {
        color: '#997B41',
        fontFamily: 'EuclidSquare-SemiBold',
    },
});

export default SubcategoriesFilter;