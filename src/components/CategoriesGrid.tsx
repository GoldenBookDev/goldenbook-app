import React from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width } = Dimensions.get('window');

interface Category {
    id: string;
    title: string;
    icon: React.FC<any>;
}

interface CategoriesGridProps {
    categories: Category[];
    onCategoryPress: (categoryId: string, categoryTitle: string) => void;
}

const CategoriesGrid: React.FC<CategoriesGridProps> = ({ categories, onCategoryPress }) => {
    const renderCategoryItem = (item: Category, index: number) => {
        const Icon = item.icon;
        return (
            <TouchableOpacity
                key={item.id}
                style={styles.categoryItem}
                onPress={() => onCategoryPress(item.id, item.title)}
            >
                <Icon width={width * 0.06} height={width * 0.06} fill="#997B41" style={{ marginRight: width * 0.02 }} />
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
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        padding: width * 0.03,
        marginBottom: width * 0.03,
    },
    categoryText: {
        fontSize: width * 0.03,
        fontFamily: 'EuclidSquare-Medium',
        color: '#1A1A2E',
    },
});

export default CategoriesGrid;
