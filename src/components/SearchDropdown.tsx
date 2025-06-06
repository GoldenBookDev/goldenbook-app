import React from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { Establishment } from '../services/firestoreService';
import i18n from '../i18n'; // Importar i18n

const { width } = Dimensions.get('window');

interface SearchDropdownProps {
  results: Establishment[];
  onSelectEstablishment: (establishmentId: string) => void;
  onShowAllResults?: () => void;
  visible: boolean;
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({
  results,
  onSelectEstablishment,
  onShowAllResults,
  visible
}) => {
  if (!visible || results.length === 0) {
    return null;
  }

  const limitedResults = results.slice(0, 5);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>{i18n.t('search.suggestions')}</Text>
      </View>
      
      <ScrollView 
        style={styles.resultsContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {limitedResults.map(item => (
          <TouchableOpacity
            key={item.id}
            style={styles.resultItem}
            onPress={() => onSelectEstablishment(item.id)}
          >
            <Text style={styles.resultName}>
              {item.name.charAt(0).toUpperCase() + item.name.slice(1).toLowerCase()}
            </Text>
            <Text style={styles.resultAddress}>
              {item.address}, {item.city}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      
      {onShowAllResults && results.length > 0 && (
        <TouchableOpacity
          style={styles.showAllButton}
          onPress={onShowAllResults}
        >
          <Text style={styles.showAllText}>{i18n.t('search.showAllResults')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: width * 0.15, // Position below search bar
    left: width * 0.04,
    right: width * 0.04,
    maxHeight: width * 0.8,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
  },
  header: {
    paddingHorizontal: width * 0.04,
    paddingVertical: width * 0.03,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerText: {
    fontSize: width * 0.035,
    fontFamily: 'EuclidSquare-Medium',
    color: '#6C757D',
  },
  resultsContainer: {
    maxHeight: width * 0.6,
  },
  resultItem: {
    paddingHorizontal: width * 0.04,
    paddingVertical: width * 0.03,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  resultName: {
    fontSize: width * 0.038,
    fontFamily: 'EuclidSquare-Medium',
    color: '#1A1A2E',
    marginBottom: width * 0.01,
  },
  resultAddress: {
    fontSize: width * 0.035,
    fontFamily: 'EuclidSquare-Regular',
    color: '#6C757D',
  },
  showAllButton: {
    paddingHorizontal: width * 0.04,
    paddingVertical: width * 0.03,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    alignItems: 'center',
  },
  showAllText: {
    fontSize: width * 0.035,
    fontFamily: 'EuclidSquare-Medium',
    color: '#00B383',
  },
});

export default SearchDropdown;