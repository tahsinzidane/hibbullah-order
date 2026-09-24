import { SymbolView } from "expo-symbols";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import colors from "../../constants/colors";
import sizes from "../../constants/sizes";
import spacing from "../../constants/spacing";
import { fontFamily, fontSize, lineHeight } from "../../constants/typography";
import shadows from "../../constants/shadows";

type SearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSubmit?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
};

export default function SearchBar({
  value,
  onChangeText,
  placeholder = "Search products",
  onSubmit,
  onFocus,
  onBlur,
}: SearchBarProps) {
  return (
    <View style={styles.wrapper}>
      <SymbolView
        name={{ ios: "magnifyingglass", android: "search", web: "search" }}
        tintColor={colors.textMuted}
        size={18}
        style={styles.icon}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        onSubmitEditing={onSubmit}
        onFocus={onFocus}
        onBlur={onBlur}
        returnKeyType="search"
        accessibilityLabel="Search products"
        style={styles.input}
      />
      {value ? (
        <Pressable
          onPress={() => onChangeText("")}
          style={styles.clearButton}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
        >
          <SymbolView
            name={{ ios: "xmark", android: "close", web: "close" }}
            tintColor={colors.primary}
            size={14}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: sizes.inputHeight,
    borderRadius: sizes.radius.pill,
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.lg,
    ...shadows.sm,
  },
  icon: {
    marginRight: spacing.xs,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.footnote,
    lineHeight: fontSize.footnote * lineHeight.normal,
    paddingVertical: spacing.sm,
    marginLeft: spacing.sm,
  },
  clearButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});