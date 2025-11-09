import OcrScanner from "@/components/ocr-scanner";
import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";

const OcrDrawerDemo: React.FC = () => {
  const { colors } = useAgrisaColors();

  const handleLog = (message: string) => {
    console.log("OCR Log:", message);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors?.card ?? "#fff" }]}
    >
      <OcrScanner onResult={handleLog} />
    </SafeAreaView>
  );
};

export default OcrDrawerDemo;

const styles = StyleSheet.create({
  container: { flex: 1 },
});
