import React from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity
} from 'react-native';

const { width } = Dimensions.get('window');

interface CategoryWithIcon {
    id: string;
    title: string;
    icon: React.FC<any>;
}

interface CategoryFiltersProps {
    categories: CategoryWithIcon[];
    selectedCategory: string | null;
    onCategoryPress: (categoryId: string) => void;
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
                const Icon = category.icon;
                return (
                    <TouchableOpacity
                        key={category.id}
                        style={[
                            categoryStyles.categoryButton,
                            selectedCategory === category.id && categoryStyles.categoryButtonSelected
                        ]}
                        onPress={() => onCategoryPress(category.id)}
                    >
                        {React.createElement(Icon, {
                            width: width * 0.045,
                            height: width * 0.045
                        })}
                        <Text style={[
                            categoryStyles.categoryButtonText,
                            selectedCategory === category.id && categoryStyles.categoryButtonTextSelected
                        ]}>{category.title}</Text>
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
        backgroundColor: '#F5F5F5',
        paddingVertical: width * 0.02,
        paddingHorizontal: width * 0.03,
        borderRadius: 20,
        marginRight: width * 0.02,
    },
    categoryButtonSelected: {
        backgroundColor: '#1A1A2E',
    },
    categoryButtonText: {
        fontSize: width * 0.03,
        fontFamily: 'EuclidSquare-Medium',
        color: '#1A1A2E',
        marginLeft: width * 0.01,
    },
    categoryButtonTextSelected: {
        color: 'white',
    },
});

export default CategoryFilters;