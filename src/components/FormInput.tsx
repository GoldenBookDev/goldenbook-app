import React from 'react';
import {
    Dimensions,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    View
} from 'react-native';

const { width } = Dimensions.get('window');

interface FormInputProps extends TextInputProps {
    label: string;
    helperText?: string;
    error?: string;
}

const FormInput: React.FC<FormInputProps> = ({
    label,
    helperText,
    error,
    style,
    ...textInputProps
}) => {
    return (
        <View style={formInputStyles.formGroup}>
            <Text style={formInputStyles.label}>{label}</Text>
            <TextInput
                style={[formInputStyles.input, style]}
                placeholderTextColor="#ADB5BD"
                {...textInputProps}
            />
            {helperText && !error && (
                <Text style={formInputStyles.helperText}>{helperText}</Text>
            )}
            {error && (
                <Text style={formInputStyles.errorText}>{error}</Text>
            )}
        </View>
    );
};

const formInputStyles = StyleSheet.create({
    formGroup: {
        marginBottom: width * 0.04,
    },
    label: {
        fontSize: width * 0.04,
        fontFamily: 'EuclidSquare-Medium',
        color: '#1A1A2E',
        marginBottom: width * 0.01,
    },
    input: {
        borderWidth: 1,
        borderColor: '#CED4DA',
        borderRadius: 8,
        paddingHorizontal: width * 0.03,
        paddingVertical: Platform.OS === 'ios' ? width * 0.03 : width * 0.02,
        fontSize: width * 0.04,
        fontFamily: 'EuclidSquare-Regular',
        color: '#1A1A2E',
    },
    helperText: {
        fontSize: width * 0.035,
        fontFamily: 'EuclidSquare-Regular',
        color: '#6C757D',
        marginTop: width * 0.01,
    },
    errorText: {
        fontSize: width * 0.035,
        fontFamily: 'EuclidSquare-Regular',
        color: '#E53935',
        marginTop: width * 0.01,
    },
});

export default FormInput;