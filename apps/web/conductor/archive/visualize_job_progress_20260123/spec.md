# Specification: İş İlerlemesi Görselleştirme

## Kapsam
Kullanıcıların (İşçi, Yönetici, Müşteri) bir montaj işinin ne kadarının bittiğini ilk bakışta anlamasını sağlayacak görsel araçların eklenmesi.

## Görsel Kararlar
- **Web:** Yatay İlerleme Çubuğu (Horizontal Progress Bar). Daha fazla veri alanı olduğu için geniş bir bar tercih edildi.
- **Mobil:** Dairesel Gösterge (Circular Progress). Ekran alanı kısıtlı olduğu için kompakt ve modern bir dairesel ikonik gösterge tercih edildi.

## Hesaplama Algoritması
```typescript
const totalSteps = job.steps.length;
const completedSteps = job.steps.filter(s => s.isCompleted).length;
const progressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
```

## Renk Skalası
- **%0 - %30:** Uyarıcı Sarı/Turuncu (Başlangıç aşaması)
- **%31 - %99:** Güven Verici Mavi (Devam ediyor)
- **%100:** Başarı Yeşili (Tamamlandı)

## Teknik Araçlar
- **Web:** Tailwind CSS, Shadcn `Progress` bileşeni.
- **Mobil:** React Native `View` (veya `react-native-progress` kütüphanesi), `Animated` API.
