import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';

const { width } = Dimensions.get('window');

interface CategoryTitleProps {
    icon: React.ComponentType<any>;
    iconProps?: any;
    title: string;
}

const CategoryTitle: React.FC<CategoryTitleProps> = ({
    icon: IconComponent,
    iconProps = {},
    title
}) => {
    const iconSize = width * 0.08;
    const iconColor = "#997B41";

    return (
        <View style={titleStyles.titleContainer}>
            <IconComponent
                size={iconSize}
                color={iconColor}
                {...iconProps}
            />
            <Text style={titleStyles.categoryTitle}>{title}</Text>
        </View>
    );
};

const titleStyles = StyleSheet.create({
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: width * 0.04,
        paddingTop: width * 0.02,
        marginBottom: width * 0.03,
        backgroundColor: 'white',
        // ✅ ASEGURAR que no hay borders
    },
    categoryTitle: {
        fontSize: width * 0.055,
        fontFamily: 'EuclidSquare-SemiBold',
        color: '#1A1A2E',
        marginLeft: width * 0.03,
    },
});

export default CategoryTitle;