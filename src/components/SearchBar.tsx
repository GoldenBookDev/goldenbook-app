import React, { forwardRef } from 'react';
import {
  Dimensions,
  StyleSheet,
  TextInput,
  TextInputProps,
  View
} from 'react-native';

import SearchIcon from '../assets/images/icons/search.svg';

const { width } = Dimensions.get('window');

interface SearchBarProps extends TextInputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  onSubmitEditing?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  style?: object;
}

// Usando forwardRef para poder pasar la referencia al TextInput
const SearchBar = forwardRef<TextInput, SearchBarProps>(({
  placeholder,
  value,
  onChangeText,
  onSubmitEditing,
  onFocus,
  onBlur,
  style,
  ...props
}, ref) => {
  return (
    <View style={[styles.searchBar, style]}>
      <SearchIcon width={width * 0.05} height={width * 0.05} fill="#999" />
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        placeholderTextColor="#999"
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmitEditing}
        onFocus={onFocus}
        onBlur={onBlur}
        clearButtonMode="while-editing"
        returnKeyType="search"
        ref={ref}
        {...props}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 25,
    paddingHorizontal: width * 0.04,
    height: width * 0.11,
  },
  searchInput: {
    flex: 1,
    fontSize: width * 0.04,
    fontFamily: 'EuclidSquare-Regular',
    color: '#333',
    marginLeft: width * 0.02,
  },
});

export default SearchBar;