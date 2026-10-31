const crops = ["rice", "maize", "pulses"],
  stages = ["seedling", "vegetative", "flowering", "harvest"];
export function readCropPreference(place: string) {
  try {
    const raw = JSON.parse(
      localStorage.getItem(`mokinn-crop:${place}`) || "{}",
    );
    return {
      crop: crops.includes(raw.crop) ? String(raw.crop) : "rice",
      stage: stages.includes(raw.stage) ? String(raw.stage) : "vegetative",
    };
  } catch {
    return { crop: "rice", stage: "vegetative" };
  }
}
export function saveCropPreference(
  place: string,
  value: { crop: string; stage: string },
) {
  if (!crops.includes(value.crop) || !stages.includes(value.stage)) return;
  try {
    localStorage.setItem(`mokinn-crop:${place}`, JSON.stringify(value));
  } catch {
    /* Session choice still works. */
  }
}
