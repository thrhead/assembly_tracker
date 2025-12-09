import React from 'react';
import { View, Text } from 'react-native';
import { COLORS } from '../constants/theme';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: COLORS.backgroundDark }}>
                    <Text style={{ color: 'white', fontSize: 18, marginBottom: 10 }}>Bir hata oluştu</Text>
                    <Text style={{ color: 'red', textAlign: 'center' }}>{this.state.error?.toString()}</Text>
                </View>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
