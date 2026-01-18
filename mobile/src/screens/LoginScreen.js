import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ImageBackground,
  ScrollView,
  Dimensions,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import LoginForm from '../components/LoginForm';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [showLoginForm, setShowLoginForm] = useState(false);
  const { theme, isDark } = useTheme();

  const renderLanding = () => (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />

      {/* 45% Height Hero Gradient Section */}
      <View style={styles.heroContainer}>
        <LinearGradient
          colors={isDark ? ['#312e81', '#581c87'] : ['#6366F1', '#A855F7']} // Darker purple in dark mode
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.heroGradient}
        >
          {/* Background Circular Decorations (SVG-like) */}
          <View style={styles.decorationContainer}>
            {/* Large Outer Circle */}
            <View style={[styles.circleOutline, { width: 300, height: 300, borderRadius: 150, opacity: 0.1 }]} />
            {/* Medium Circle */}
            <View style={[styles.circleOutline, { width: 200, height: 200, borderRadius: 100, opacity: 0.2 }]} />
            {/* Small Inner Circle */}
            <View style={[styles.circleOutline, { width: 100, height: 100, borderRadius: 50, borderWidth: 1, opacity: 0.3 }]} />

            {/* Connecting Lines (Simulated with absolute views) */}
            <View style={[styles.line, { width: 150, top: 150, left: 50, transform: [{ rotate: '45deg' }] }]} />
            <View style={[styles.line, { width: 150, top: 150, left: 100, transform: [{ rotate: '-45deg' }] }]} />

            {/* Small Dots */}
            <View style={[styles.dot, { top: 100, left: 150 }]} />
            <View style={[styles.dot, { bottom: 100, right: 150 }]} />
          </View>

          {/* Glass Panel Centered */}
          <View style={styles.glassPanelContainer}>
            <View style={[styles.glassPanel, { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.25)' }]}>
              {/* Floating Icons */}
              <View style={[styles.floatingIconRight, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)' }]}>
                <MaterialIcons name="hub" size={32} color="#fff" />
              </View>
              <View style={[styles.floatingIconLeft, { backgroundColor: 'rgba(99, 102, 241, 0.5)' }]}>
                <MaterialIcons name="monitor-heart" size={24} color="#fff" />
              </View>

              {/* Center Content */}
              <View style={styles.glassCenterContent}>
                <View style={styles.appIconSquare}>
                  <MaterialIcons name="analytics" size={40} color="#6366F1" />
                </View>
                <Text style={styles.appName}>SyncPro</Text>
                <Text style={styles.appTagline}>Global Operations Interface</Text>
              </View>
            </View>
          </View>

          {/* Fade to bottom */}
          <LinearGradient
            colors={['transparent', theme.colors.background]}
            style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 60 }}
          />
        </LinearGradient>
      </View>

      {/* Bottom Content Section */}
      <View style={styles.bottomSection}>
        <View style={styles.textSection}>
          <Text style={[styles.mainTitle, { color: theme.colors.text }]}>
            Smart Operations{'\n'}Starts Here.
          </Text>
          <Text style={[styles.subTitle, { color: theme.colors.subText }]}>
            Digitize tracking, costs, and management for your field teams.
          </Text>
        </View>

        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => Alert.alert("Bilgi", "Kayıt olma özelliği henüz aktif değil.")}
          >
            <Text style={[styles.primaryButtonText, { color: '#fff' }]}>Get Started</Text>
            <MaterialIcons name="arrow-forward" size={20} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.googleButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}
            onPress={() => Alert.alert("Bilgi", "Google Login henüz aktif değil.")}
          >
            <View style={{ marginRight: 10 }}>
              {/* Simple Google G icon representation or placeholder */}
              <MaterialIcons name="public" size={20} color={theme.colors.subText} />
            </View>
            <Text style={[styles.googleButtonText, { color: theme.colors.text }]}>Continue with Google</Text>
          </TouchableOpacity>

          <View style={styles.signInContainer}>
            <Text style={[styles.signInText, { color: theme.colors.subText }]}>Already have an account?</Text>
            <TouchableOpacity onPress={() => setShowLoginForm(true)}>
              <Text style={[styles.signInLink, { color: theme.colors.primary }]}>Sign In</Text>
            </TouchableOpacity>
          </View>

          {/* Footer Features */}
          <View style={styles.footerFeatures}>
            <View style={styles.featureItem}>
              <MaterialIcons name="verified-user" size={20} color={theme.colors.subText} />
              <Text style={[styles.featureText, { color: theme.colors.subText }]}>SECURE</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
            <View style={styles.featureItem}>
              <MaterialIcons name="cloud-done" size={20} color={theme.colors.subText} />
              <Text style={[styles.featureText, { color: theme.colors.subText }]}>REAL-TIME</Text>
            </View>
          </View>
        </View>

        {/* Bottom Handle Indicator */}
        <View style={{ alignItems: 'center', paddingBottom: 8 }}>
          <View style={{ width: 120, height: 5, backgroundColor: theme.colors.border, borderRadius: 2.5 }} />
        </View>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        {showLoginForm ? (
          <LoginForm
            onBack={() => setShowLoginForm(false)}
            onLoginSuccess={() => { /* Navigation handled by AuthContext */ }}
          />
        ) : renderLanding()}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroContainer: {
    height: height * 0.45,
    width: '100%',
    overflow: 'hidden',
  },
  heroGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  decorationContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleOutline: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  line: {
    position: 'absolute',
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'white',
    opacity: 0.8,
  },
  glassPanelContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  glassPanel: {
    width: 260,
    height: 260,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    // Shadow for glass
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  floatingIconRight: {
    position: 'absolute',
    top: -24,
    right: -24,
    width: 70,
    height: 70,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  floatingIconLeft: {
    position: 'absolute',
    bottom: 40,
    left: -20,
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  glassCenterContent: {
    alignItems: 'center',
  },
  appIconSquare: {
    width: 70,
    height: 70,
    backgroundColor: '#fff',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  appName: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  appTagline: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  bottomSection: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 24,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  textSection: {
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 40,
  },
  subTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 24,
  },
  buttonSection: {
    gap: 16,
    marginTop: 'auto',
    paddingBottom: 24,
  },
  primaryButton: {
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  googleButton: {
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  signInContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  signInText: {
    fontWeight: '500',
  },
  signInLink: {
    fontWeight: 'bold',
  },
  footerFeatures: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 16,
    opacity: 0.6,
  },
  featureItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 4,
    letterSpacing: 1,
  },
  divider: {
    width: 1,
    height: 20,
  }
});
