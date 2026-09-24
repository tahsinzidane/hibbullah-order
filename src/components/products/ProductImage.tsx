import { Image } from "expo-image";
import { memo, useState, useEffect } from "react";
import { StyleSheet, type ImageStyle, type StyleProp } from "react-native";
import colors from "../../constants/colors";
import { layout } from "../../constants/sizes";

const placeholder = require("@/assets/images/placeholders/product-placeholder.png");

type ProductImageProps = {
  uri?: string | null;
  recyclingKey?: string;
  style?: StyleProp<ImageStyle>;
  fallback?: any;
};

function ProductImage({ uri, recyclingKey, style, fallback = placeholder }: ProductImageProps) {
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
  }, [uri]);

  const hasUri = !!uri && !failed;
  // expo-image handles http/https; treat empty as placeholder
  return (
    <Image
      source={hasUri ? { uri: uri as string } : fallback}
      placeholder={fallback}
      placeholderContentFit="cover"
      recyclingKey={recyclingKey}
      cachePolicy="memory-disk"
      priority="low"
      contentFit="cover"
      transition={recyclingKey ? 0 : 180}
      onError={() => setFailed(true)}
      style={[styles.image, style]}
    />
  );
}

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: layout.productImage,
    backgroundColor: "#F8F8F6",
  },
});

export default memo(ProductImage);
