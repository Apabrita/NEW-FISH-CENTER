export const getDeviceId = (): string => {
  if (typeof window !== "undefined") {
    let devId = localStorage.getItem("nfc_device_id");
    if (!devId) {
      devId = "device_" + Math.random().toString(36).slice(2, 11);
      localStorage.setItem("nfc_device_id", devId);
    }
    return devId;
  }
  return "unknown_device";
};
