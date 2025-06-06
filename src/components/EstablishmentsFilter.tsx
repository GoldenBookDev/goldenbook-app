import React from 'react';
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity
} from 'react-native';
import i18n from '../i18n';

const { width } = Dimensions.get('window');

interface FilterOption {
    id: string;
    title: string;
}

interface EstablishmentsFilterProps {
    selectedFilter: string;
    onFilterSelect: (filterId: string) => void;
}

const EstablishmentsFilter: React.FC<EstablishmentsFilterProps> = ({
    selectedFilter,
    onFilterSelect
}) => {
    const filters: FilterOption[] = [
        { id: 'recommended', title: i18n.t('category.recommended') },
        { id: 'open_now', title: i18n.t('category.openNow') },
        { id: 'near_me', title: i18n.t('category.nearMe') },
        { id: 'most_liked', title: i18n.t('category.mostLiked') }
    ];

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={filterStyles.filtersList}
            contentContainerStyle={filterStyles.filtersContainer}
            keyboardShouldPersistTaps="handled"
            removeClippedSubviews={true}
        >
            {filters.map((item) => (
                <TouchableOpacity
                    key={item.id}
                    style={[
                        filterStyles.filterButton,
                        selectedFilter === item.id && filterStyles.filterButtonActive
                    ]}
                    onPress={() => onFilterSelect(item.id)}
                >
                    <Text style={[
                        filterStyles.filterButtonText,
                        selectedFilter === item.id && filterStyles.filterButtonTextActive
                    ]}>
                        {item.title}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
};

const filterStyles = StyleSheet.create({
    filtersList: {
        backgroundColor: 'white',
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    filtersContainer: {
        paddingHorizontal: width * 0.04,
        paddingVertical: width * 0.02,
        flexDirection: 'row',
    },
    filterButton: {
        paddingHorizontal: width * 0.015,
        paddingVertical: width * 0.025,
        marginHorizontal: width * 0.02,
    },
    filterButtonActive: {
        borderBottomWidth: 2,
        borderBottomColor: '#997B41',
    },
    filterButtonText: {
        fontSize: width * 0.033,
        fontFamily: 'EuclidSquare-Medium',
        color: '#999',
    },
    filterButtonTextActive: {
        color: '#997B41',
        fontFamily: 'EuclidSquare-SemiBold',
    },
});

export default EstablishmentsFilter;