import { StyleSheet, Text, View } from "react-native";
import colors from "../../constants/colors";
import { radius } from "../../constants/sizes";
import spacing from "../../constants/spacing";
import { fontFamily, fontSize, lineHeight } from "../../constants/typography";

export default function DiscountBadge({ percent }: { percent: number }) {
  return (
    <View style={styles.badge} accessibilityLabel={`${percent} percent discount`}>
      <Text style={styles.text}>-{percent}%</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: colors.goldSoft,
    borderRadius: radius.pill,
    overflow: "hidden",
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
  },
  text: {
    color: colors.gold,
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.micro,
    lineHeight: fontSize.micro * lineHeight.tight,
    letterSpacing: 0.4,
  },
});
