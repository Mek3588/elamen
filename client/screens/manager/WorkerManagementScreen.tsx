import React, { useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown } from "react-native-reanimated";
import { EmptyState } from "@/components/EmptyState";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useData } from "@/context/DataContext";
import { BorderRadius, Spacing, Shadows, RestaurantColors } from "@/constants/theme";
import { Worker } from "@/types";

export default function WorkerManagementScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const { theme } = useTheme();
  const { workers, addWorker, deleteWorker } = useData();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddWorker = async () => {
    if (!newUsername.trim() || !newPassword.trim()) return;

    setIsAdding(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    try {
      await addWorker(newUsername.trim(), newPassword);
      setNewUsername("");
      setNewPassword("");
      setShowAddModal(false);
    } catch (error) {
      console.error("Failed to add worker:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteWorker = async (worker: Worker) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    await deleteWorker(worker.id);
  };

  const renderWorkerItem = ({ item, index }: { item: Worker; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 50).duration(400)}
      style={[styles.workerRow, { backgroundColor: theme.surface }, Shadows.small]}
    >
      <View
        style={[
          styles.avatarCircle,
          { backgroundColor: RestaurantColors.primary + "20" },
        ]}
      >
        <Feather name="user" size={20} color={RestaurantColors.primary} />
      </View>
      <View style={styles.workerInfo}>
        <ThemedText style={styles.workerName}>{item.username}</ThemedText>
        <ThemedText style={[styles.workerDate, { color: theme.textSecondary }]}>
          Added {new Date(item.createdAt).toLocaleDateString()}
        </ThemedText>
      </View>
      <Pressable
        onPress={() => handleDeleteWorker(item)}
        style={({ pressed }) => [
          styles.deleteButton,
          { opacity: pressed ? 0.6 : 1 },
        ]}
      >
        <Feather name="trash-2" size={18} color={theme.error} />
      </Pressable>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.backgroundRoot }]}>
      <FlatList
        data={workers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingTop: headerHeight + Spacing.xl,
          paddingBottom: insets.bottom + Spacing.xl,
          paddingHorizontal: Spacing.lg,
        }}
        ListEmptyComponent={
          <EmptyState
            image={require("../../../assets/images/avatar-placeholder.png")}
            title="No workers yet"
            description="Add kitchen staff to get started"
          />
        }
        renderItem={renderWorkerItem}
      />

      <Pressable
        onPress={() => setShowAddModal(true)}
        style={({ pressed }) => [
          styles.fab,
          {
            backgroundColor: RestaurantColors.primary,
            bottom: insets.bottom + Spacing.lg,
            opacity: pressed ? 0.9 : 1,
          },
          Shadows.large,
        ]}
      >
        <Feather name="plus" size={24} color="#FFFFFF" />
      </Pressable>

      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Add New Worker</ThemedText>
              <Pressable onPress={() => setShowAddModal(false)}>
                <Feather name="x" size={24} color={theme.text} />
              </Pressable>
            </View>

            <View style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
                  Username
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.backgroundDefault,
                      borderColor: theme.border,
                      color: theme.text,
                    },
                  ]}
                  placeholder="Enter username"
                  placeholderTextColor={theme.textSecondary}
                  value={newUsername}
                  onChangeText={setNewUsername}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
                  Password
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: theme.backgroundDefault,
                      borderColor: theme.border,
                      color: theme.text,
                    },
                  ]}
                  placeholder="Enter password"
                  placeholderTextColor={theme.textSecondary}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry
                />
              </View>

              <Pressable
                onPress={handleAddWorker}
                disabled={isAdding || !newUsername.trim() || !newPassword.trim()}
                style={({ pressed }) => [
                  styles.addButton,
                  {
                    backgroundColor: RestaurantColors.primary,
                    opacity: pressed || isAdding || !newUsername.trim() || !newPassword.trim() ? 0.6 : 1,
                  },
                ]}
              >
                <ThemedText style={styles.addButtonText}>
                  {isAdding ? "Adding..." : "Add Worker"}
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  workerRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  workerInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  workerName: {
    fontSize: 16,
    fontWeight: "600",
  },
  workerDate: {
    fontSize: 13,
    marginTop: 2,
  },
  deleteButton: {
    padding: Spacing.sm,
  },
  fab: {
    position: "absolute",
    right: Spacing.lg,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingBottom: Spacing["4xl"],
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  modalBody: {
    padding: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: Spacing.sm,
  },
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
  },
  addButton: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.md,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
  },
});
