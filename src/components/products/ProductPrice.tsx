import { StyleSheet, Text, View } from "react-native";
import colors from "../../constants/colors";
import spacing from "../../constants/spacing";
import { fontFamily, fontSize } from "../../constants/typography";
import { formatCurrency } from "../../utils/currency";

export default function ProductPrice({
  price,
  originalPrice,
}: {
  price: number;
  originalPrice?: number;
}) {
  return (
    <View style={styles.row} accessibilityLabel={`Price ${formatCurrency(price)}`}>
      <Text style={styles.price}>{formatCurrency(price)}</Text>
      {originalPrice && originalPrice > price ? (
        <Text style={styles.original}>{formatCurrency(originalPrice)}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.sm,
    marginTop: spacing.xs,
    flexWrap: "wrap",
  },
  price: {
    color: colors.text,
    fontFamily: fontFamily.pjsBold,
    fontSize: fontSize.callout,
    lineHeight: fontSize.callout * 1.2,
  },
  original: {
    color: colors.textMuted,
    fontFamily: fontFamily.pjsRegular,
    fontSize: fontSize.micro,
    textDecorationLine: "line-through",
  },
});