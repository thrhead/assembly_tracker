import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Svg, Circle } from "react-native-svg";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";
import GlassCard from "../ui/GlassCard";

const JobInfoCard = ({ job }) => {
  const { theme } = useTheme();
  const { t } = useTranslation();

  if (!job) return null;

  const totalSteps = job.steps?.length || 0;
  const completedSteps = job.steps?.filter((s) => s.isCompleted).length || 0;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  // Helper for Circular Progress
  const renderCircularProgress = () => {
    const size = 60;
    const strokeWidth = 6;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (progress / 100) * circumference;

    const getColor = () => {
      if (progress === 100) return theme.colors.success || "#10B981";
      if (progress > 30) return theme.colors.primary || "#3b82f6";
      return "#f97316"; // orange-500
    };

    return (
      <View
        style={{
          width: size,
          height: size,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Svg
          width={size}
          height={size}
          style={{ transform: [{ rotate: "-90deg" }] }}
        >
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={theme.dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getColor()}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
          />
        </Svg>
        <View
          style={[
            StyleSheet.absoluteFill,
            { alignItems: "center", justifyContent: "center" },
          ]}
        >
          <Text
            style={{
              fontSize: size * 0.22,
              fontWeight: "bold",
              color: theme.colors.text,
            }}
          >
            {Math.round(progress)}%
          </Text>
        </View>
      </View>
    );
  };

  return (
    <GlassCard style={styles.card} theme={theme}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <View style={styles.infoRow}>
            <MaterialIcons
              name="business"
              size={16}
              color={theme.colors.subText}
            />
            <Text style={[styles.infoText, { color: theme.colors.subText, fontWeight: 'bold' }]}>
              {job.customer?.company || job.customer?.name || "Müşteri"}
            </Text>
          </View>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 12,
              marginBottom: 8,
              marginTop: 4
            }}
          >
            <View>
              <Text
                style={{
                  fontSize: 10,
                  color: theme.colors.subText,
                  fontWeight: "bold",
                }}
              >
                PROJE NO
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "bold",
                  color: theme.colors.primary,
                }}
              >
                {job.jobNo || job.projectNo || "OTOMATİK"}
              </Text>
            </View>

            {job.projectNo && job.projectNo !== job.jobNo && (
              <View>
                <Text
                  style={{
                    fontSize: 10,
                    color: theme.colors.subText,
                    fontWeight: "bold",
                  }}
                >
                  REF NO
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "bold",
                    color: theme.colors.secondary || "#10b981",
                  }}
                >
                  {job.projectNo}
                </Text>
              </View>
            )}
            
            <View>
              <Text
                style={{
                  fontSize: 10,
                  color: theme.colors.subText,
                  fontWeight: "bold",
                }}
              >
                KAYIT ID
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "bold",
                  color: theme.colors.text,
                }}
              >
                #{job.id?.toString().slice(-6).toUpperCase()}
              </Text>
            </View>
          </View>

          <Text style={[styles.jobTitle, { color: theme.colors.text, marginTop: 4 }]}>
            {job.title}
          </Text>

          {(job.budget || job.estimatedDuration) && (
            <View style={{ flexDirection: "row", gap: 12, marginTop: 4 }}>
              {job.budget > 0 && (
                <View style={styles.infoRow}>
                  <MaterialIcons
                    name="attach-money"
                    size={16}
                    color={theme.colors.success || "#10B981"}
                  />
                  <Text
                    style={[
                      styles.infoText,
                      { color: theme.colors.text, fontWeight: "600" },
                    ]}
                  >
                    {job.budget?.toLocaleString("tr-TR", {
                      style: "currency",
                      currency: "TRY",
                    })}
                  </Text>
                </View>
              )}
              {job.estimatedDuration > 0 && (
                <View style={styles.infoRow}>
                  <MaterialIcons
                    name="timer"
                    size={16}
                    color={theme.colors.warning || "#F59E0B"}
                  />
                  <Text
                    style={[
                      styles.infoText,
                      { color: theme.colors.text, fontWeight: "600" },
                    ]}
                  >
                    {job.estimatedDuration} dk
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
        {totalSteps > 0 && renderCircularProgress()}
      </View>

      <View style={styles.separator} />

      <View style={styles.infoRow}>
        <MaterialIcons
          name="description"
          size={16}
          color={theme.colors.subText}
        />
        <Text style={[styles.description, { color: theme.colors.subText }]}>
          {job.description || "Açıklama yok"}
        </Text>
      </View>

      {job.status === "IN_PROGRESS" && job.startedAt && totalSteps > 0 && (
        <View style={styles.estimationContainer}>
          <View style={styles.infoRow}>
            <MaterialIcons
              name="timer"
              size={16}
              color={theme.colors.primary}
            />
            <Text
              style={[
                styles.infoText,
                { color: theme.colors.text, fontWeight: "600" },
              ]}
            >
              Tahmini Bitiş:{" "}
              {(() => {
                if (completedSteps === 0) return "Hesaplanıyor...";
                const start = new Date(job.startedAt).getTime();
                const now = new Date().getTime();
                const elapsed = now - start;
                const progressRatio = completedSteps / totalSteps;
                const totalEst = elapsed / progressRatio;
                const finishDate = new Date(start + totalEst);
                return finishDate.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });
              })()}
            </Text>
          </View>
          <Text
            style={{
              fontSize: 10,
              color: theme.colors.subText,
              marginLeft: 24,
            }}
          >
            {completedSteps}/{totalSteps} Adım Tamamlandı
          </Text>
        </View>
      )}
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
  },
  estimationContainer: {
    marginTop: 12,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.02)",
    borderRadius: 8,
  },
  separator: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.05)",
    marginVertical: 12,
  },
});

export default JobInfoCard;
