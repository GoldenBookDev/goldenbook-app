import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// ✅ NUEVO: Import del sistema de iconos
import { CategoryIcon } from '../components/icons/IconSystem';

const { width } = Dimensions.get('window');

// ✅ ACTUALIZADO: Interface para usar string en lugar de React.FC
interface Category {
    id: string;
    title: string;
    icon: string; // ✅ CAMBIADO: ahora es string
}

interface CategoriesGridProps {
    categories: Category[];
    onCategoryPress: (categoryId: string, categoryTitle: string) => void;
}

const CategoriesGrid: React.FC<CategoriesGridProps> = ({ categories, onCategoryPress }) => {
    const renderCategoryItem = (item: Category, index: number) => {
        return (
            <TouchableOpacity
                key={item.id}
                style={styles.categoryItem}
                onPress={() => onCategoryPress(item.id, item.title)}
            >
                {/* ✅ REEMPLAZADO: Icon component por CategoryIcon */}
                <CategoryIcon
                    category={item.icon}
                    type="category"
                    size={width * 0.10} // ✅ Un poco más pequeño (era 0.12)
                    iconSize={width * 0.05} // ✅ Un poco más pequeño (era 0.06)
                    iconColor="#915A17"
                    backgroundColor="#F8EDD2"
                    style={{ marginRight: width * 0.02 }}
                />
                <Text style={styles.categoryText}>{item.title}</Text>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.categoriesGrid}>
            {categories.map(renderCategoryItem)}
        </View>
    );
};

const styles = StyleSheet.create({
    categoriesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: width * 0.04,
    },
    categoryItem: {
        width: '48%',
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderRadius: 9,
        paddingHorizontal: width * 0.03, // ✅ Mantener padding horizontal
        paddingVertical: width * 0.01, // ✅ REDUCIR padding vertical (era 0.03)
        marginBottom: width * 0.03,
        borderWidth: 1,
        borderColor: '#E9ECEF'
    },
    categoryText: {
        fontSize: width * 0.03,
        fontFamily: 'EuclidSquare-Regular',
        color: '#161B33',
    },
});

export default CategoriesGrid;