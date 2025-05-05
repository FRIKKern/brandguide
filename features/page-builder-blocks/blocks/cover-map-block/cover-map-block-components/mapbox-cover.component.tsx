"use client";

import type React from "react";
import { useRef, useEffect } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import * as turf from "@turf/turf";

export interface MapboxMapCoverProps {
  center: {
    lat: number;
    lng: number;
  };
  zoom?: number; // final zoom level
  mapStyle?: string;
  theme?: "dark" | "light";
  animateIntro: {
    enabled: boolean;
    initialZoom: number;
    initialPitch: number;
    duration: number;
  }; // Controls the intro camera animation
  bearingRotation?: {
    enabled: boolean;
    speed: number;
    introDelay: number;
  }; // Controls the bearing rotation animation
  radiusAnimation?: {
    enabled: boolean;
    duration: number;
    spawnInterval: number;
    radius: number;
    opacity: {
      startOpacity: number;
      endOpacity: number;
    };
    color: string;
    introDelay: number;
  }; // Controls the ripple (radius) animation
}

const MapboxMapCover: React.FC<MapboxMapCoverProps> = ({
  center,
  zoom = 7.5,
  mapStyle,
  theme = "light",
  // Provide defaults if not specified:
  animateIntro = {
    enabled: true,
    initialZoom: zoom + 4.5,
    initialPitch: 120,
    duration: 3000,
  },
  bearingRotation = {
    enabled: true,
    speed: 0.005,
    introDelay: animateIntro.enabled ? animateIntro.duration : 0,
  },
  radiusAnimation = {
    enabled: true,
    duration: 10000,
    spawnInterval: 4000,
    radius: 140, // maximum ripple radius
    opacity: {
      startOpacity: 0.3,
      endOpacity: 0, // ripple fades out completely
    },
    color: "#FFA500", // ripple color
    introDelay: animateIntro.enabled ? animateIntro.duration : 0,
  },
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);

  const computedMapStyle =
    mapStyle ||
    (theme === "light"
      ? "mapbox://styles/mapbox/light-v10"
      : "mapbox://styles/mapbox/dark-v10");

  useEffect(() => {
    if (!mapboxgl.accessToken) {
      mapboxgl.accessToken =
        process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN ||
        "pk.eyJ1IjoiZnJpa2siLCJhIjoiY2s4ZjN5eHRkMDBjMTNsbnp6dWVpbXlqbSJ9.76Bp2Hb2cnEWJlcuYOxGzw";
    }

    // Use the new animateIntro config for initial values.
    const finalZoom = zoom;
    const initialZoom = animateIntro.enabled ? animateIntro.initialZoom : zoom;

    const finalPitch = 80;
    const initialPitch = animateIntro.enabled ? animateIntro.initialPitch : finalPitch;

    const finalBearing = -13.6;
    const initialBearing = animateIntro.enabled ? -17.6 : finalBearing;

    const introAnimationDuration = animateIntro.enabled ? animateIntro.duration : 0;

    let rotationAnimationFrameId: number;
    let pulseAnimationFrameId: number;
    let rotateTimeoutId: ReturnType<typeof setTimeout>;
    let radiusTimeoutId: ReturnType<typeof setTimeout>;

    if (mapContainer.current) {
      const map = new mapboxgl.Map({
        container: mapContainer.current,
        style: computedMapStyle,
        center: center,
        zoom: initialZoom,
        pitch: initialPitch,
        bearing: initialBearing,
      });

      // Disable interactive controls for a static cover view.
      map.scrollZoom.disable();
      map.boxZoom.disable();
      map.dragRotate.enable();
      map.dragPan.enable();
      map.keyboard.disable();
      map.doubleClickZoom.disable();
      map.touchZoomRotate.disable();

      // Array to store active ripple circles (each with its start time)
      const circles: { start: number }[] = [];
      const rippleDuration = radiusAnimation.duration;
      const rippleSpawnInterval = radiusAnimation.spawnInterval;
      let lastSpawnTime = 0;

      map.on("load", () => {
        // Setup popup content
        const popupContent =
          theme === "dark"
            ? `
            <div
              class="p-4 bg-gray-900 rounded-lg border border-[#00000010]  text-sm font-sans space-y-2 text-gray-100"
              style="min-width: 200px;"
            >
              <p>
                <span class="font-medium">E-post:</span>
                <a href="mailto:info@veitrygghet.no" class="underline">
                  info@veitrygghet.no
                </a>
              </p>
              <p><span class="font-medium">Adresse:</span> Bølerveien 84, 2020 Skedsmokorset</p>
              <p class="font-sans">
                <span class="font-medium">Telefon:</span>
                <a href="tel:+4722300200" class="underline">
                  +47 22 300 200
                </a>
              </p>
              <p><span class="font-medium">Org.nr:</span> 928 409 074</p>
            </div>
            `
            : `
            <div
              class="p-4 rounded-lg text-sm space-y-2 text-gray-800"
              style="min-width: 200px;"
            >
              <p>
                <span class="font-medium">E-post:</span>
                <a href="mailto:info@veitrygghet.no" class="underline text-blue-600">
                  info@veitrygghet.no
                </a>
              </p>
              <p><span class="font-medium">Adresse:</span> Bølerveien 84, 2020 Skedsmokorset</p>
              <p>
                <span class="font-medium">Telefon:</span>
                <a href="tel:+4722300200" class="underline text-blue-600">
                  +47 22 300 200
                </a>
              </p>
              <p><span class="font-medium">Org.nr:</span> 928 409 074</p>
            </div>
            `;

        const popup = new mapboxgl.Popup({
          closeOnClick: false,
          closeButton: true,
          anchor: "left",
          offset: 25,
        })
          .setLngLat(center)
          .setHTML(popupContent);

        new mapboxgl.Marker({ color: "#FFA500" })
          .setLngLat(center)
          .setPopup(popup)
          .addTo(map);

        if (theme === "dark") {
          const layers = map.getStyle()?.layers;
          if (layers) {
            layers.forEach((layer) => {
              if (
                layer.type === "line" &&
                layer.id?.toLowerCase().includes("road")
              ) {
                try {
                  map.setPaintProperty(layer.id, "line-color", "#1b1b1b");
                } catch (error) {
                  console.error(`Failed to update layer ${layer.id}:`, error);
                }
              }
            });
          }
        }

        const styleLayers = map.getStyle()?.layers;
        let labelLayerId: string | undefined;
        if (styleLayers) {
          for (const layer of styleLayers) {
            if (
              layer.type === "symbol" &&
              layer.layout &&
              (layer.layout as any)["text-field"]
            ) {
              labelLayerId = layer.id;
              break;
            }
          }
        }

        map.addLayer(
          {
            id: "3d-buildings",
            source: "composite",
            "source-layer": "building",
            filter: ["==", "extrude", "true"],
            type: "fill-extrusion",
            minzoom: 15,
            paint: {
              "fill-extrusion-color": "#aaa",
              "fill-extrusion-height": [
                "interpolate",
                ["linear"],
                ["zoom"],
                15,
                0,
                15.05,
                ["get", "height"],
              ],
              "fill-extrusion-base": [
                "interpolate",
                ["linear"],
                ["zoom"],
                15,
                0,
                15.05,
                ["get", "min_height"],
              ],
              "fill-extrusion-opacity": 0.6,
            },
          },
          labelLayerId
        );

        map.addSource("pulse-circle-source", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: [],
          },
        });

        map.addLayer({
          id: "pulse-circle",
          type: "fill",
          source: "pulse-circle-source",
          layout: {},
          paint: {
            // Use the new radiusAnimation color here.
            "fill-color": radiusAnimation.color,
            "fill-opacity": ["get", "opacity"],
          },
        });

        const easeInOutQuad = (t: number) =>
          t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

        function animateCircles(now: number) {
          if (!lastSpawnTime) lastSpawnTime = now - rippleSpawnInterval;
          if (now - lastSpawnTime >= rippleSpawnInterval) {
            circles.push({ start: now });
            lastSpawnTime = now;
          }

          const features = [];
          for (let i = circles.length - 1; i >= 0; i--) {
            const circle = circles[i];
            const t = (now - circle.start) / rippleDuration;
            if (t > 1) {
              circles.splice(i, 1);
              continue;
            }
            // Calculate the current radius based on the new property.
            const currentRadius = t * radiusAnimation.radius;
            // Interpolate opacity between start and end values.
            const currentOpacity =
              radiusAnimation.opacity.startOpacity +
              (radiusAnimation.opacity.endOpacity - radiusAnimation.opacity.startOpacity) * t;
            const circleFeature = turf.circle([center.lng, center.lat], currentRadius, {
              steps: 64,
              units: "kilometers",
            });
            circleFeature.properties = { opacity: currentOpacity };
            features.push(circleFeature);
          }

          const featureCollection = {
            type: "FeatureCollection",
            features,
          };

          const source = map.getSource("pulse-circle-source") as mapboxgl.GeoJSONSource;
          if (source) {
            source.setData(featureCollection as GeoJSON.FeatureCollection);
          }

          pulseAnimationFrameId = requestAnimationFrame(animateCircles);
        }

        function rotateMap() {
          map.rotateTo(map.getBearing() + bearingRotation.speed, { duration: 0 });
          rotationAnimationFrameId = requestAnimationFrame(rotateMap);
        }

        // Animate the camera either via an easeTo or jumpTo.
        if (animateIntro.enabled) {
          map.easeTo({
            center: center,
            zoom: finalZoom,
            pitch: finalPitch,
            bearing: finalBearing,
            duration: introAnimationDuration,
            easing: easeInOutQuad,
          });
        } else {
          map.jumpTo({
            center: center,
            zoom: finalZoom,
            pitch: finalPitch,
            bearing: finalBearing,
          });
        }

        // Start the ripple animation after an optional delay.
        if (radiusAnimation.enabled) {
          if (radiusAnimation.introDelay > 0) {
            radiusTimeoutId = setTimeout(() => {
              pulseAnimationFrameId = requestAnimationFrame(animateCircles);
            }, radiusAnimation.introDelay);
          } else {
            pulseAnimationFrameId = requestAnimationFrame(animateCircles);
          }
        }

        // Start bearing rotation after its introDelay.
        if (bearingRotation.enabled) {
          if (bearingRotation.introDelay > 0) {
            rotateTimeoutId = setTimeout(() => {
              rotateMap();
            }, bearingRotation.introDelay);
          } else {
            rotateMap();
          }
        }
      });

      return () => {
        if (rotationAnimationFrameId)
          cancelAnimationFrame(rotationAnimationFrameId);
        if (pulseAnimationFrameId)
          cancelAnimationFrame(pulseAnimationFrameId);
        if (rotateTimeoutId) clearTimeout(rotateTimeoutId);
        if (radiusTimeoutId) clearTimeout(radiusTimeoutId);
        map.remove();
      };
    }
  }, [center, zoom, computedMapStyle, theme, animateIntro, radiusAnimation, bearingRotation]);

  return <div ref={mapContainer} style={{ width: "100%", height: "100%" }} />;
};

export default MapboxMapCover;
