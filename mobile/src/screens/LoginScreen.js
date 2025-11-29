import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ImageBackground,
  ScrollView,
  Dimensions,
  StatusBar,
  SafeAreaView
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

const COLORS = {
  primary: "#CCFF04",
  backgroundLight: "#f8f8f5",
  backgroundDark: "#010100",
  textLight: "#e2e8f0", // slate-200
  textDark: "#1e293b", // slate-800
  slate500: "#64748b",
  slate700: "#334155",
  white: "#ffffff",
  black: "#000000",
};

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'Lütfen e-posta ve şifre giriniz.');
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      // AuthContext handles navigation
    } else {
      Alert.alert('Giriş Hatası', result.error || 'Bir hata oluştu');
    }
  };

  const renderLanding = () => (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.backgroundDark} />

      {/* Top Image Section */}
      <View style={styles.imageContainer}>
        <ImageBackground
          source={{ uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuAYxW6oDVJGfIJeF5jX477eaJ2dYcFaUvsB_tCZ57FFMUaGU88sv5Rcjnhe-_JqzamcGQImX6ioR7wjwzv8dBJDXuAGkzYdPHbxuXyhmUGHjT6BzESRUmUqvfTo2h_PweT8EILApUYE7r7kDtfo7p241tS8XI25jbk1t477S_gG9N9E0OeCYWKluCba_rjixZGoKS6cz0KPfJMgBwWZmnQY-CISAhiiwdfw7in5SrQXZXLM9evwrH6PfbbTpcFSJLWt7W2Mr7hW9wa2" }}
          style={styles.topImage}
          imageStyle={{ borderRadius: 8 }}
        />
      </View>

      {/* Title */}
      <Text style={styles.title}>Saha Operasyonlarınızı Kolaylaştırın</Text>

      {/* Features Carousel */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.featuresScroll}>
        <View style={styles.featureCard}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="location-on" size={32} color={COLORS.primary} />
          </View>
          <Text style={styles.featureText}>Ekibinizi gerçek zamanlı takip edin.</Text>
        </View>

        <View style={styles.featureCard}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="payments" size={32} color={COLORS.primary} />
          </View>
          <Text style={styles.featureText}>Masrafları hareket halindeyken kontrol edin.</Text>
        </View>

        <View style={styles.featureCard}>
          <View style={styles.iconCircle}>
            <MaterialIcons name="business-center" size={32} color={COLORS.primary} />
          </View>
          <Text style={styles.featureText}>Projeleri her yerden yönetin.</Text>
        </View>
      </ScrollView>

      {/* Pagination Dots */}
      <View style={styles.paginationContainer}>
        <View style={[styles.dot, styles.activeDot]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>

      <View style={{ flex: 1 }} />

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.createAccountButton} onPress={() => Alert.alert("Bilgi", "Kayıt olma özelliği henüz aktif değil.")}>
          <Text style={styles.createAccountText}>Hesap Oluştur</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton} onPress={() => setShowLoginForm(true)}>
          <Text style={styles.loginButtonText}>Giriş Yap</Text>
        </TouchableOpacity>

        <Text style={styles.termsText}>
          Devam ederek, <Text style={styles.linkText}>Hizmet Şartları</Text> ve <Text style={styles.linkText}>Gizlilik Politikası</Text>'nı kabul etmiş olursunuz.
        </Text>
      </View>
    </ScrollView>
  );

  const renderLoginForm = () => (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.backgroundDark} />
      <View style={styles.loginFormContainer}>
        <TouchableOpacity onPress={() => setShowLoginForm(false)} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
          <Text style={{ color: COLORS.primary, marginLeft: 5 }}>Geri</Text>
        </TouchableOpacity>

        <Text style={styles.loginTitle}>Giriş Yap</Text>

        <TextInput
          style={styles.input}
          placeholder="E-posta"
          placeholderTextColor={COLORS.slate500}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          editable={!loading}
        />
        <TextInput
          style={styles.input}
          placeholder="Şifre"
          placeholderTextColor={COLORS.slate500}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          editable={!loading}
        />

        {loading ? (
          <ActivityIndicator size="large" color={COLORS.primary} />
        ) : (
          <TouchableOpacity style={styles.submitButton} onPress={handleLogin}>
            <Text style={styles.submitButtonText}>Giriş Yap</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.hint}>Test: worker1@montaj.com / worker123</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.backgroundDark }}>
      {showLoginForm ? renderLoginForm() : renderLanding()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundDark,
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  imageContainer: {
    padding: 16,
    paddingTop: 12,
  },
  topImage: {
    width: '100%',
    height: 260,
    overflow: 'hidden',
    borderRadius: 8,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 12,
    lineHeight: 38,
  },
  featuresScroll: {
    maxHeight: 200,
    marginBottom: 20,
  },
  featureCard: {
    width: width * 0.6,
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 8,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(204, 255, 4, 0.1)', // primary with opacity
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureText: {
    color: COLORS.textLight,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.slate700,
  },
  activeDot: {
    backgroundColor: COLORS.primary,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 16,
  },
  createAccountButton: {
    backgroundColor: COLORS.primary,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createAccountText: {
    color: COLORS.black,
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginButton: {
    backgroundColor: 'transparent',
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  loginButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  termsText: {
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.slate500,
    marginTop: 8,
  },
  linkText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  // Login Form Styles
  loginFormContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10,
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: COLORS.slate700,
    borderRadius: 8,
    padding: 12,
    color: COLORS.white,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: COLORS.black,
    fontSize: 16,
    fontWeight: 'bold',
  },
  hint: {
    marginTop: 20,
    textAlign: 'center',
    color: COLORS.slate500,
    fontSize: 12,
  },
});
