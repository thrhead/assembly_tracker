import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import CustomButton from '../CustomButton';
import CustomInput from '../CustomInput';
import { ThemeProvider } from '../../context/ThemeContext';

// Mock icons
jest.mock('@expo/vector-icons', () => ({
  MaterialIcons: 'MaterialIcons',
}));

// Wrapper for Theme Context
const Wrapper = ({ children }) => (
  <ThemeProvider>{children}</ThemeProvider>
);

describe('UI Components Accessibility', () => {
  it('CustomButton has correct accessibility role and label', () => {
    const onPress = jest.fn();
    const { getByRole, getByText } = render(
      <Wrapper>
        <CustomButton title="Test Button" onPress={onPress} />
      </Wrapper>
    );

    const button = getByRole('button');
    expect(button).toBeTruthy();
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('CustomInput has accessibility label', () => {
    const { getByLabelText } = render(
      <Wrapper>
        <CustomInput label="Test Input" value="" onChangeText={() => {}} />
      </Wrapper>
    );

    // Should be able to find by label text now because we added accessibilityLabel={label}
    const input = getByLabelText('Test Input');
    expect(input).toBeTruthy();
  });
});
