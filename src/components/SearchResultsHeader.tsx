import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import EstablishmentsFilter from '../components/EstablishmentsFilter';
import SearchBar from '../components/SearchBar';
import i18n from '../i18n';

const { width } = Dimensions.get('window');

interface SearchResultsHeaderProps {
    searchQuery: string;
    locationName: string;
    resultsCount: number;
    selectedFilter: string;
    onSearchChange: (text: string) => void;
    onFilterSelect: (filterId: string) => void;
    onSearchSubmit?: () => void;
}

const SearchResultsHeader: React.FC<SearchResultsHeaderProps> = ({
    searchQuery,
    locationName,
    resultsCount,
    selectedFilter,
    onSearchChange,
    onFilterSelect,
    onSearchSubmit
}) => {
    return (
        <>
            <View style={resultsHeaderStyles.searchSection}>
                <SearchBar
                    placeholder={`${i18n.t('category.searchIn')} ${locationName}`}
                    value={searchQuery}
                    onChangeText={onSearchChange}
                    onSubmitEditing={onSearchSubmit}
                    style={resultsHeaderStyles.searchBar}
                />
            </View>

            <View style={resultsHeaderStyles.resultsHeader}>
                <Text style={resultsHeaderStyles.resultsTitle}>
                    {resultsCount} {resultsCount === 1 ? 'result' : 'results'} for "{searchQuery}"
                </Text>
                <EstablishmentsFilter
                    selectedFilter={selectedFilter}
                    onFilterSelect={onFilterSelect}
                />
            </View>
        </>
    );
};

const resultsHeaderStyles = StyleSheet.create({
    searchSection: {
        backgroundColor: 'white',
        paddingHorizontal: width * 0.04,
        paddingVertical: width * 0.03,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5E5',
    },
    searchBar: {},
    resultsHeader: {
        backgroundColor: 'white',
        paddingTop: width * 0.03,
        paddingBottom: width * 0.02,
        paddingHorizontal: width * 0.04,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    resultsTitle: {
        fontSize: width * 0.04,
        fontFamily: 'EuclidSquare-Medium',
        color: '#1A1A2E',
        marginBottom: width * 0.02,
    },
});

export default SearchResultsHeader;