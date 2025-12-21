import { useAgrisaColors } from "@/domains/agrisa_theme/hooks/useAgrisaColor";
import CoordinateConverter, {
  BoundaryPolygon,
  Coordinate,
} from "@/libs/utils/coordinate-converter";
import { Box, Spinner, Text, VStack } from "@gluestack-ui/themed";
import Constants from "expo-constants";
import { AlertCircle, RotateCcw } from "lucide-react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { WebView } from "react-native-webview";

// ===== INTERFACE =====

interface FarmBoundaryMapProps {
  boundary: BoundaryPolygon | null;
  isVn2000?: boolean;
  province?: string; // Tên tỉnh/thành để auto-detect central meridian
  height?: number;
  showControls?: boolean;
}

// ===== CONSTANTS =====

const DEFAULT_VIETNAM_CENTER: Coordinate = {
  latitude: 16.0544,
  longitude: 108.2022,
};

// ===== HTML TEMPLATE =====

/**
 * Generate HTML cho WebView với MapLibre GL và OpenMapVN satellite tiles
 */
const generateMapHTML = (
  boundary: BoundaryPolygon | null,
  apiKey: string
): string => {
  const polygonGeoJSON = boundary
    ? JSON.stringify({
        type: "Feature",
        properties: { name: "Farm Boundary" },
        geometry: boundary,
      })
    : "null";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>OpenMapVN - Farm Boundary</title>
  
  <!-- MapLibre GL CSS -->
  <link href="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css" rel="stylesheet" />
  
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    html, body {
      height: 100%;
      overflow: hidden;
    }
    
    #map {
      width: 100%;
      height: 100%;
    }
    
    .maplibregl-ctrl-bottom-left,
    .maplibregl-ctrl-bottom-right {
      display: none;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  
  <!-- MapLibre GL JS -->
  <script src="https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js"></script>
  
  <script>
    // ===== CONFIG =====
    const API_KEY = '${apiKey}';
    const POLYGON_DATA = ${polygonGeoJSON};
    
    // ===== INIT MAP =====
    const map = new maplibregl.Map({
      container: "map",
      style: "https://maptiles.openmap.vn/styles/satellite-v1/style.json?apikey=" + API_KEY,
      center: [108.2022, 16.0544], // Default Vietnam center
      zoom: 6,
      maxZoom: 19,
      minZoom: 6,
      attributionControl: true,
    });
    
    // Disable rotation
    map.dragRotate.disable();
    map.touchZoomRotate.disableRotation();
    
    // ===== POLYGON LAYER =====
    map.on('load', function() {
      // Add polygon source
      if (POLYGON_DATA) {
        map.addSource('farm-boundary', {
          type: 'geojson',
          data: POLYGON_DATA
        });
        
        // Add polygon fill layer
        map.addLayer({
          id: 'farm-boundary-fill',
          type: 'fill',
          source: 'farm-boundary',
          paint: {
            'fill-color': '#F59E0B',
            'fill-opacity': 0.2
          }
        });
        
        // Add polygon outline layer
        map.addLayer({
          id: 'farm-boundary-outline',
          type: 'line',
          source: 'farm-boundary',
          paint: {
            'line-color': '#F59E0B',
            'line-width': 3,
            'line-opacity': 0.8
          }
        });
        
        // Fit bounds to polygon
        const coordinates = POLYGON_DATA.geometry.coordinates[0];
        const bounds = coordinates.reduce((bounds, coord) => {
          return bounds.extend(coord);
        }, new maplibregl.LngLatBounds(coordinates[0], coordinates[0]));
        
        map.fitBounds(bounds, {
          padding: 50,
          duration: 1000
        });
      } else {
        // Không có polygon, zoom vào Việt Nam
        map.flyTo({
          center: [108.2022, 16.0544],
          zoom: 6,
          duration: 1000
        });
      }
      
      // Send ready event
      sendMessage('mapReady', { hasPolygon: !!POLYGON_DATA });
    });
    
    // ===== COMMUNICATION WITH REACT NATIVE =====
    function sendMessage(type, data) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({ type, data }));
      }
    }
    
    // ===== MAP EVENTS =====
    map.on('moveend', () => {
      const center = map.getCenter();
      const zoom = map.getZoom();
      sendMessage('mapMoved', { 
        center: [center.lng, center.lat],
        zoom: zoom
      });
    });
    
    map.on('click', (e) => {
      sendMessage('mapClicked', {
        lat: e.lngLat.lat,
        lng: e.lngLat.lng
      });
    });
  </script>
</body>
</html>
  `.trim();
};

// ===== COMPONENT =====

/**
 * Component hiển thị bản đồ ranh giới nông trại với OpenMapVN Satellite
 * Sử dụng WebView + MapLibre GL để tránh dependency vào native modules
 *
 * Features:
 * - ✅ Hiển thị polygon ranh giới nông trại trên satellite map
 * - ✅ Hỗ trợ chuyển đổi VN2000 -> WGS84 cho hiển thị
 * - ✅ Tích hợp OpenMapVN satellite tiles
 * - ✅ Auto fitBounds vào polygon
 * - ✅ Reload button
 */
export const FarmBoundaryMap: React.FC<FarmBoundaryMapProps> = ({
  boundary,
  isVn2000 = false,
  province,
  height = 400,
  showControls = true,
}) => {
  const { colors } = useAgrisaColors();
  const [mapReady, setMapReady] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const [wgs84Boundary, setWgs84Boundary] = useState<BoundaryPolygon | null>(
    null
  );
  const [isConverting, setIsConverting] = useState(false);
  const webViewRef = useRef<WebView>(null);

  // ===== CHUYỂN ĐỔI TỌA ĐỘ (ASYNC) =====

  useEffect(() => {
    const convertBoundary = async () => {
      if (!boundary) {
        setWgs84Boundary(null);
        return;
      }

      try {
        if (isVn2000) {
          setIsConverting(true);
          console.log("🗺️ Converting VN2000 boundary to WGS84 via API", {
            province,
          });

          const converted =
            await CoordinateConverter.convertBoundaryVn2000ToWgs84(
              boundary,
              province // ⭐ Pass province để auto-detect central meridian
            );

          console.log(
            "✅ Converted boundary:",
            JSON.stringify(converted.coordinates[0].slice(0, 2))
          ); // Log first 2 points
          setWgs84Boundary(converted);
        } else {
          console.log("✅ Using WGS84 boundary as-is");
          setWgs84Boundary(boundary);
        }
      } catch (error) {
        console.error("❌ Error converting boundary:", error);
        setWgs84Boundary(null);
      } finally {
        setIsConverting(false);
      }
    };

    convertBoundary();
  }, [boundary, isVn2000, province]);

  // ===== API KEY =====

  const apiKey =
    Constants.expoConfig?.extra?.EXPO_PUBLIC_OPENMAPVN_KEY ||
    process.env.EXPO_PUBLIC_OPENMAPVN_KEY ||
    "";

  // ===== GENERATE MAP HTML =====

  const mapHTML = useMemo(() => {
    if (!wgs84Boundary || !apiKey) {
      console.log("⚠️ Warning: Missing boundary or API key");
      return generateMapHTML(null, apiKey);
    }
    return generateMapHTML(wgs84Boundary, apiKey);
  }, [wgs84Boundary, apiKey]);

  // ===== WEBVIEW MESSAGE HANDLER =======

  const handleWebViewMessage = useCallback((event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);

      if (message.type === "mapReady") {
        console.log("✅ Map ready");
        setMapReady(true);
      }
    } catch (error) {
      console.error("❌ Error parsing WebView message:", error);
    }
  }, []);

  // ===== MAP CONTROLS =====

  const reloadMap = useCallback(() => {
    console.log("🔄 Reloading map...");
    setMapReady(false);
    // Force WebView re-mount bằng cách update key
    setMapKey((prev) => prev + 1);
  }, []);

  // ===== RENDER =====

  // Show loading khi đang convert VN2000
  if (isConverting) {
    return (
      <Box
        bg={colors.background}
        borderRadius="$lg"
        borderWidth={1}
        borderColor={colors.frame_border}
        p="$4"
        height={height}
        justifyContent="center"
        alignItems="center"
      >
        <VStack space="md" alignItems="center">
          <Spinner size="large" color={colors.primary} />
          <VStack space="xs" alignItems="center">
            <Text
              fontSize="$md"
              fontWeight="$semibold"
              color={colors.primary_text}
            >
              Đang chuyển đổi tọa độ...
            </Text>
            <Text
              fontSize="$sm"
              color={colors.secondary_text}
              textAlign="center"
            >
              VN2000 → WGS84 qua API
            </Text>
          </VStack>
        </VStack>
      </Box>
    );
  }

  if (!wgs84Boundary) {
    return (
      <Box
        bg={colors.background}
        borderRadius="$lg"
        borderWidth={1}
        borderColor={colors.frame_border}
        p="$4"
        height={height}
        justifyContent="center"
        alignItems="center"
      >
        <VStack space="md" alignItems="center">
          <AlertCircle
            size={48}
            color={colors.secondary_text}
            strokeWidth={1.5}
          />
          <VStack space="xs" alignItems="center">
            <Text
              fontSize="$md"
              fontWeight="$semibold"
              color={colors.primary_text}
            >
              Có lỗi khi tải bản đồ
            </Text>
            <Text
              fontSize="$sm"
              color={colors.secondary_text}
              textAlign="center"
            >
              Vui lòng nhập tọa độ nông trại. Nếu lỗi còn xảy ra, hãy liên hệ bộ
              phận hỗ trợ.
            </Text>
          </VStack>
        </VStack>
      </Box>
    );
  }

  return (
    <Box
      bg={colors.background}
      borderRadius="$lg"
      borderWidth={1}
      borderColor={colors.frame_border}
      overflow="hidden"
      height={height}
      position="relative"
    >
      {/* WebView Map */}
      <WebView
        key={`map-${mapKey}`}
        ref={webViewRef}
        source={{ html: mapHTML }}
        style={styles.webview}
        onMessage={handleWebViewMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        renderLoading={() => (
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="rgba(255,255,255,0.95)"
            justifyContent="center"
            alignItems="center"
          >
            <VStack space="md" alignItems="center">
              <Spinner size="large" color={colors.primary} />
              <Text fontSize="$sm" color={colors.secondary_text}>
                Đang tải bản đồ...
              </Text>
            </VStack>
          </Box>
        )}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.error("❌ WebView error:", nativeEvent);
        }}
      />

      {/* Reload Button */}
      {showControls && (
        <Box
          position="absolute"
          top="$4"
          right="$4"
          bg={colors.background}
          borderRadius="$md"
          borderWidth={1}
          borderColor={colors.frame_border}
          overflow="hidden"
        >
          <TouchableOpacity onPress={reloadMap}>
            <Box p="$2">
              <RotateCcw size={20} color={colors.primary} strokeWidth={2} />
            </Box>
          </TouchableOpacity>
        </Box>
      )}
    </Box>
  );
};

// ===== STYLES =====

const styles = StyleSheet.create({
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

// ===== EXPORT =====
export default FarmBoundaryMap;
