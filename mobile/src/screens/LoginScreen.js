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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import CustomButton from '../components/CustomButton';
import LoginForm from '../components/LoginForm';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [showLoginForm, setShowLoginForm] = useState(false);

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
        <CustomButton
          title="Hesap Oluştur"
          onPress={() => Alert.alert("Bilgi", "Kayıt olma özelliği henüz aktif değil.")}
        />

        <CustomButton
          title="Giriş Yap"
          variant="outline"
          onPress={() => setShowLoginForm(true)}
        />

        <Text style={styles.termsText}>
          Devam ederek, <Text style={styles.linkText}>Hizmet Şartları</Text> ve <Text style={styles.linkText}>Gizlilik Politikası</Text>'nı kabul etmiş olursunuz.
        </Text>
      </View>
    </ScrollView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.backgroundDark }}>
      {showLoginForm ? (
        <LoginForm
          onBack={() => setShowLoginForm(false)}
          onLoginSuccess={() => { /* Navigation handled by AuthContext */ }}
        />
      ) : renderLanding()}
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
    backgroundColor: 'rgba(204, 255, 4, 0.1)',
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
});
