import React, { useState, useEffect } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import * as Location from "expo-location";
// import { GeofencingEventType } from "expo-location";

import * as TaskManager from "expo-task-manager";
// import * as Permissions from "expo-permissions";
// import { LOCATION_FOREGROUND } from "expo-permissions";

const LOCATION_TRACKING = "location-tracking";

export default function App() {
  const [result, setResult] = useState("");

  const startLocationTracking = async () => {
    const hasStarted = await Location.hasStartedLocationUpdatesAsync(
      LOCATION_TRACKING
    );
    console.log("tracking started?", hasStarted);

    if (!hasStarted) {
      await Location.startLocationUpdatesAsync(LOCATION_TRACKING, {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000 * 5,
        // deferredUpdatesInterval: 1000,
        pausesUpdatesAutomatically: false,
        distanceInterval: 0,
        showsBackgroundLocationIndicator: true,
        // activityType: ActivityType.AutomotiveNavigation,

        foregroundService: {
          killServiceOnDestroy: false,
          notificationTitle: "Covid Tracker",
          notificationBody: "Rastreando sua localização",
          notificationColor: "#AA1111",
        },
      });
    }
  };

  useEffect(() => {
    const config = async () => {
      let res1 = await Location.requestForegroundPermissionsAsync();
      let res2 = await Location.requestBackgroundPermissionsAsync();

      if (res1.status !== "granted" && res2.status !== "granted") {
        console.log("Permission to access location was denied");
      } else {
        console.log("Permission to access location granted");
      }
    };

    config();
  }, []);

  return (
    <View style={styles.container}>
      <Button title="Start tracking" onPress={startLocationTracking} />
      <Text>{result}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});

TaskManager.defineTask(LOCATION_TRACKING, async ({ data }, error) => {
  if (error) {
    console.log("LOCATION_TRACKING task ERROR:", error);
    return;
  }
  if (data) {
    const { locations } = data;
    let lat1 = locations[0].coords.latitude;
    let lon1 = locations[0].coords.longitude;
    let lat2 = 31.9713089;
    let lon2 = 35.8350942;

    let distance = haversine(lat1, lon1, lat2, lon2);
    console.log(distance * 1000);
    if (distance * 1000 <= 10) {
      console.log("in building");
    } else {
      console.log("out building");
    }
    // if (eventType === GeofencingEventType.Enter) {
    //   console.log("You've entered region:", region);
    // } else if (eventType === GeofencingEventType.Exit) {
    //   console.log("You've left region:", region);

    console.log(`${new Date(Date.now()).toLocaleString()}: ${lat1},${lon1}`);
    // setResult("ereer");
  }
});

function haversine(lat1, lon1, lat2, lon2) {
  // distance between latitudes
  // and longitudes
  let dLat = ((lat2 - lat1) * Math.PI) / 180.0;
  let dLon = ((lon2 - lon1) * Math.PI) / 180.0;

  // convert to radiansa
  lat1 = (lat1 * Math.PI) / 180.0;
  lat2 = (lat2 * Math.PI) / 180.0;

  // apply formulae
  let a =
    Math.pow(Math.sin(dLat / 2), 2) +
    Math.pow(Math.sin(dLon / 2), 2) * Math.cos(lat1) * Math.cos(lat2);
  let rad = 6377.830272;
  let c = 2 * Math.asin(Math.sqrt(a));
  return rad * c;
}
