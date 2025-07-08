import React from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity
} from 'react-native';

// ✅ NUEVO: Import del sistema de iconos
import { CategoryIcon } from '../components/icons/IconSystem';

const { width } = Dimensions.get('window');

// ✅ ACTUALIZADO: Interface para usar string en lugar de React.FC
interface CategoryWithIcon {
    id: string;
    title: string;
    icon: string; // ✅ CAMBIADO: ahora es string
    translatedTitle?: string;
}

interface CategoryFiltersProps {
    categories: CategoryWithIcon[];
    selectedCategory: string | null; // ✅ Mantener como nullable
    onCategoryPress: (categoryId: string | null) => void; // ✅ Permitir null para deseleccionar
}

const CategoryFilters: React.FC<CategoryFiltersProps> = ({
    categories,
    selectedCategory,
    onCategoryPress
}) => {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={categoryStyles.categoriesScrollContent}
            style={categoryStyles.categoriesScroll}
        >
            {categories.map((category) => {
                // Usar translatedTitle si existe, sino usar title original
                const displayTitle = category.translatedTitle || category.title;
                const isSelected = selectedCategory === category.id;

                return (
                    <TouchableOpacity
                        key={category.id}
                        style={[
                            categoryStyles.categoryButton,
                            isSelected && categoryStyles.categoryButtonSelected
                        ]}
                        onPress={() => {
                            // ✅ CAMBIO: Si ya está seleccionado, deseleccionar (null)
                            // Si no está seleccionado, seleccionar
                            onCategoryPress(isSelected ? null : category.id);
                        }}
                    >
                        {/* ✅ REEMPLAZADO: Icon component por CategoryIcon */}
                        <CategoryIcon
                            category={category.icon}
                            type="category"
                            size={width * 0.09}
                            iconSize={width * 0.045}
                            iconColor={isSelected ? "#915A17" : "#666"}
                            backgroundColor={isSelected ? "transparent" : "#F8EDD2"}
                        />
                        <Text style={[
                            categoryStyles.categoryButtonText,
                            isSelected && categoryStyles.categoryButtonTextSelected
                        ]}>
                            {displayTitle}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
};

const categoryStyles = StyleSheet.create({
    categoriesScroll: {
        backgroundColor: 'white',
        paddingBottom: width * 0.03,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3.84,
        elevation: 3,
    },
    categoriesScrollContent: {
        paddingHorizontal: width * 0.04,
    },
    categoryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        paddingVertical: width * 0.01,
        paddingHorizontal: width * 0.02,
        borderRadius: 20,
        marginRight: width * 0.02,
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    categoryButtonSelected: {
        borderColor: '#DAA520',
        backgroundColor: 'rgba(218, 165, 32, 0.2)',
    },
    categoryButtonText: {
        fontSize: width * 0.03,
        fontFamily: 'EuclidSquare-Medium',
        color: '#495057',
        marginLeft: width * 0.01,
    },
    categoryButtonTextSelected: {
        color: '#915A17',
        fontFamily: 'EuclidSquare-Medium',
    },
});

export default CategoryFilters;