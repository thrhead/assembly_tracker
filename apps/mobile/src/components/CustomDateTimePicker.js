import React from 'react';
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { COLORS } from '../constants/theme';

const DateTimePicker = ({ theme, ...props }) => {
    const colors = theme ? theme.colors : COLORS;

    return (
        <RNDateTimePicker
            textColor={colors.text} // iOS
            accentColor={colors.primary} // Android
            themeVariant={theme && theme.dark ? 'dark' : 'light'} // iOS
            {...props}
        />
    );
};

export default DateTimePicker;
