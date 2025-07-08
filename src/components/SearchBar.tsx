import React, { forwardRef } from 'react';
import {
  Dimensions,
  StyleSheet,
  TextInput,
  TextInputProps,
  View
} from 'react-native';

import { UIIcon } from './icons/IconSystem'; // ✅ Importar UIIcon

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
      {/* ✅ ICONO CON COLOR CORRECTO */}
      <UIIcon
        name="search"
        size={width * 0.045} // Un poco más pequeño
        color="#495057" // ✅ Color correcto según maqueta
      />
      <TextInput
        style={styles.searchInput}
        placeholder={placeholder}
        placeholderTextColor="#6C757D" // ✅ Color del placeholder correcto
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
    backgroundColor: '#F8F9FA', // ✅ Fondo correcto según maqueta
    borderRadius: 25,
    paddingHorizontal: width * 0.04,
    height: width * 0.11,
    borderWidth: 1, // ✅ Border interno fino
    borderColor: '#E9ECEF', // ✅ Color del border según maqueta
  },
  searchInput: {
    flex: 1,
    fontSize: width * 0.035, // ✅ Texto más pequeño según maqueta
    fontFamily: 'EuclidSquare-Regular',
    color: '#333',
    marginLeft: width * 0.02,
  },
});

export default SearchBar;