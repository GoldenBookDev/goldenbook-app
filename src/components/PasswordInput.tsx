import React from 'react';
import {
    Dimensions,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import EyeOffIcon from '../assets/images/icons/eye-off.svg';
import EyeIcon from '../assets/images/icons/eye.svg';

const { width } = Dimensions.get('window');

interface PasswordInputProps {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    showPassword: boolean;
    onToggleVisibility: () => void;
    placeholder: string;
    helperText?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
    label,
    value,
    onChangeText,
    showPassword,
    onToggleVisibility,
    placeholder,
    helperText
}) => {
    return (
        <View style={passwordStyles.formGroup}>
            <Text style={passwordStyles.label}>{label}</Text>
            <View style={passwordStyles.passwordInputContainer}>
                <TextInput
                    style={passwordStyles.passwordInput}
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor="#ADB5BD"
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
                <TouchableOpacity style={passwordStyles.eyeButton} onPress={onToggleVisibility}>
                    {showPassword ? (
                        <EyeOffIcon width={width * 0.05} height={width * 0.05} />
                    ) : (
                        <EyeIcon width={width * 0.05} height={width * 0.05} />
                    )}
                </TouchableOpacity>
            </View>
            {helperText && (
                <Text style={passwordStyles.helperText}>{helperText}</Text>
            )}
        </View>
    );
};

const passwordStyles = StyleSheet.create({
    formGroup: {
        marginBottom: width * 0.04,
    },
    label: {
        fontSize: width * 0.04,
        fontFamily: 'EuclidSquare-Medium',
        color: '#1A1A2E',
        marginBottom: width * 0.01,
    },
    passwordInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#CED4DA',
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
    },
    passwordInput: {
        flex: 1,
        paddingHorizontal: width * 0.03,
        paddingVertical: Platform.OS === 'ios' ? width * 0.03 : width * 0.02,
        fontSize: width * 0.04,
        fontFamily: 'EuclidSquare-Regular',
        color: '#1A1A2E',
    },
    eyeButton: {
        padding: width * 0.02,
        marginRight: width * 0.01,
    },
    helperText: {
        fontSize: width * 0.035,
        fontFamily: 'EuclidSquare-Regular',
        color: '#6C757D',
        marginTop: width * 0.008,
    },
});

export default PasswordInput;