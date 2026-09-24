import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import colors from "../../constants/colors";
import { radius } from "../../constants/sizes";
import spacing from "../../constants/spacing";
import { fontFamily, fontSize, lineHeight } from "../../constants/typography";
import shadows from "../../constants/shadows";

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function HomeFilterSheet({ visible, onClose }: Props) {
  return (
    <Modal visible={visible} animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => {}}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>Filters</Text>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
              <MaterialIcons name="close" size={18} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Manufacturer</Text>
              <Text style={styles.sectionHint}>All manufacturers · tap to choose</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Category</Text>
              <Text style={styles.sectionHint}>All categories</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Price range</Text>
              <Text style={styles.sectionHint}>৳ 0 — ৳ 5000</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Availability</Text>
              <View style={styles.pillRow}>
                <View style={[styles.miniPill, styles.miniPillActive]}>
                  <Text style={[styles.miniPillText, styles.miniPillTextActive]}>In stock</Text>
                </View>
                <View style={styles.miniPill}>
                  <Text style={styles.miniPillText}>Out of stock</Text>
                </View>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sort</Text>
              <Text style={styles.sectionHint}>Relevance · Price low to high · Newest</Text>
            </View>
            <Text style={styles.footnote}>
              Full filter controls will connect to productService. For now the sheet demonstrates the soft bottom-sheet system with Material interaction.
            </Text>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable style={styles.resetBtn} onPress={onClose}>
              <Text style={styles.resetText}>Reset</Text>
            </Pressable>
            <Pressable style={styles.applyBtn} onPress={onClose}>
              <Text style={styles.applyText}>Apply</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: "flex-end",
    padding: spacing.lg,
  },
  sheet: {
    backgroundColor: colors.backgroundAlt,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
    padding: spacing.lg,
    gap: spacing.md,
    maxHeight: "78%",
    ...shadows.lg,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontFamily: fontFamily.soraSemiBold,
    fontSize: fontSize.title3,
    color: colors.text,
    letterSpacing: -0.2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.borderLight,
    alignItems: "center",
    justifyContent: "center",
  },
  content: { gap: spacing.md, paddingBottom: spacing.sm },
  section: { gap: 4 },
  sectionTitle: {
    fontFamily: fontFamily.pjsSemiBold,
    fontSize: fontSize.bodySmall,
    color: colors.text,
  },
  sectionHint: {
    fontFamily: fontFamily.pjsRegular,
    fontSize: fontSize.caption,
    lineHeight: fontSize.caption * lineHeight.normal,
    color: colors.textMuted,
  },
  divider: { height: 1, backgroundColor: colors.borderSoft },
  pillRow: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.xs },
  miniPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundAlt,
  },
  miniPillActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  miniPillText: {
    fontFamily: fontFamily.pjsSemiBold,
    fontSize: fontSize.caption,
    color: colors.text,
  },
  miniPillTextActive: { color: colors.white },
  footnote: {
    fontFamily: fontFamily.pjsRegular,
    fontSize: fontSize.caption,
    color: colors.textMuted,
    lineHeight: fontSize.caption * 1.5,
    marginTop: spacing.sm,
  },
  footer: { flexDirection: "row", gap: spacing.sm, marginTop: spacing.sm },
  resetBtn: {
    flex: 1,
    height: 44,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  resetText: { fontFamily: fontFamily.pjsSemiBold, fontSize: fontSize.footnote, color: colors.text },
  applyBtn: {
    flex: 1,
    height: 44,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  applyText: { fontFamily: fontFamily.pjsSemiBold, fontSize: fontSize.footnote, color: colors.white },
});
