import React, { useEffect, useRef } from "react";
import tt from "@tomtom-international/web-sdk-maps";
import "@tomtom-international/web-sdk-maps/dist/maps.css";

const RiderLiveLocation = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (mapInstance.current) return;

    // Initialize map (default center before location loads)
    mapInstance.current = tt.map({
      key: "JWqUSKWM1eLnRMc3ffGZ3rp0d7kta6Qs",
      container: mapRef.current,
      center: [77.5946, 12.9716], // fallback (Bangalore)
      zoom: 14,
    });

    mapInstance.current.addControl(new tt.NavigationControl());

    // Get user's current location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // Set map center
        mapInstance.current.setCenter([longitude, latitude]);

        // Add or update marker
        markerRef.current = new tt.Marker({
          color: "#7c6ef9",
        })
          .setLngLat([longitude, latitude])
          .addTo(mapInstance.current);
      },
      (error) => {
        console.error("Location error:", error);
      },
      { enableHighAccuracy: true }
    );

    // Live tracking (updates continuously)
    const watchId = navigator.geolocation.watchPosition((pos) => {
      const { latitude, longitude } = pos.coords;

      if (markerRef.current) {
        markerRef.current.setLngLat([longitude, latitude]);
      }

      mapInstance.current.setCenter([longitude, latitude]);
    });

    return () => {
      navigator.geolocation.clearWatch(watchId);

      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  return (
    <div style={styles.container}>
      <div ref={mapRef} style={styles.map} />

      {/* Overlay UI (modern SaaS look) */}
      <div style={styles.overlay}>
        <h3 style={{ margin: 0 }}>🚴 Live Rider Location</h3>
        <p style={{ margin: 0, fontSize: "14px", opacity: 0.8 }}>
          Tracking in real-time
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    background: "#0f0f1a",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    top: "20px",
    left: "20px",
    background: "rgba(20,20,35,0.8)",
    backdropFilter: "blur(10px)",
    padding: "12px 16px",
    borderRadius: "12px",
    color: "#fff",
    boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
  },
};

export default RiderLiveLocation;