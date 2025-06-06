import React from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

import PlateIcon from '../assets/images/icons/plate.svg';

const { width } = Dimensions.get('window');

interface SubcategoryData {
    id: string;
    title: string;
}

interface SubcategoriesFilterProps {
    subcategories: SubcategoryData[];
    selectedSubcategory: string | null;
    onSubcategorySelect: (subcategoryId: string | null) => void;
}

const SubcategoriesFilter: React.FC<SubcategoriesFilterProps> = ({
    subcategories,
    selectedSubcategory,
    onSubcategorySelect
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
                {subcategories.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        style={[
                            subStyles.subcategoryItem,
                            selectedSubcategory === item.id && subStyles.subcategoryItemActive
                        ]}
                        onPress={() => onSubcategorySelect(selectedSubcategory === item.id ? null : item.id)}
                    >
                        <View style={[
                            subStyles.subcategoryIconContainer,
                            selectedSubcategory === item.id && subStyles.subcategoryIconContainerActive
                        ]}>
                            <PlateIcon
                                width={width * 0.06}
                                height={width * 0.06}
                                fill={selectedSubcategory === item.id ? 'white' : '#997B41'}
                            />
                        </View>
                        <Text style={[
                            subStyles.subcategoryText,
                            selectedSubcategory === item.id && subStyles.subcategoryTextActive
                        ]}>
                            {item.title}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
};

const subStyles = StyleSheet.create({
    subcategoriesSection: {
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    subcategoriesContainer: {
        paddingHorizontal: width * 0.02,
        paddingVertical: width * 0.01,
        alignItems: 'center',
    },
    subcategoryItem: {
        alignItems: 'center',
        marginHorizontal: width * 0.025,
        padding: width * 0.02,
    },
    subcategoryItemActive: {
        backgroundColor: 'rgba(153, 123, 65, 0.1)',
        borderRadius: 8,
    },
    subcategoryIconContainer: {
        width: width * 0.12,
        height: width * 0.12,
        borderRadius: width * 0.06,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: width * 0.02,
    },
    subcategoryIconContainerActive: {
        backgroundColor: '#997B41',
    },
    subcategoryText: {
        fontSize: width * 0.033,
        fontFamily: 'EuclidSquare-Medium',
        color: '#333',
        textAlign: 'center',
    },
    subcategoryTextActive: {
        color: '#997B41',
        fontFamily: 'EuclidSquare-SemiBold',
    },
});

export default SubcategoriesFilter;