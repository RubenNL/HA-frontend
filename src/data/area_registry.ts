import { stringCompare } from "../common/string/compare";
import type { HomeAssistant } from "../types";
import type { DeviceRegistryEntry } from "./device_registry";
import type { EntityRegistryEntry } from "./entity_registry";
import type { RegistryEntry } from "./registry";

export { subscribeAreaRegistry } from "./ws-area_registry";

export interface AreaRegistryEntry extends RegistryEntry {
  area_id: string;
  floor_id: string | null;
  name: string;
  picture: string | null;
  icon: string | null;
  labels: string[];
  aliases: string[];
}

export interface AreaEntityLookup {
  [areaId: string]: EntityRegistryEntry[];
}

export interface AreaDeviceLookup {
  [areaId: string]: DeviceRegistryEntry[];
}

export interface AreaRegistryEntryMutableParams {
  name: string;
  floor_id?: string | null;
  picture?: string | null;
  icon?: string | null;
  aliases?: string[];
  labels?: string[];
}

export const createAreaRegistryEntry = (
  hass: HomeAssistant,
  values: AreaRegistryEntryMutableParams
) =>
  hass.callWS<AreaRegistryEntry>({
    type: "config/area_registry/create",
    ...values,
  });

export const updateAreaRegistryEntry = (
  hass: HomeAssistant,
  areaId: string,
  updates: Partial<AreaRegistryEntryMutableParams>
) =>
  hass.callWS<AreaRegistryEntry>({
    type: "config/area_registry/update",
    area_id: areaId,
    ...updates,
  });

export const deleteAreaRegistryEntry = (hass: HomeAssistant, areaId: string) =>
  hass.callWS({
    type: "config/area_registry/delete",
    area_id: areaId,
  });

export const getAreaEntityLookup = (
  entities: EntityRegistryEntry[]
): AreaEntityLookup => {
  const areaEntityLookup: AreaEntityLookup = {};
  for (const entity of entities) {
    if (!entity.area_id) {
      continue;
    }
    if (!(entity.area_id in areaEntityLookup)) {
      areaEntityLookup[entity.area_id] = [];
    }
    areaEntityLookup[entity.area_id].push(entity);
  }
  return areaEntityLookup;
};

export const getAreaDeviceLookup = (
  devices: DeviceRegistryEntry[]
): AreaDeviceLookup => {
  const areaDeviceLookup: AreaDeviceLookup = {};
  for (const device of devices) {
    if (!device.area_id) {
      continue;
    }
    if (!(device.area_id in areaDeviceLookup)) {
      areaDeviceLookup[device.area_id] = [];
    }
    areaDeviceLookup[device.area_id].push(device);
  }
  return areaDeviceLookup;
};

export const areaCompare =
  (entries?: HomeAssistant["areas"], order?: string[]) =>
  (a: string, b: string) => {
    const indexA = order ? order.indexOf(a) : -1;
    const indexB = order ? order.indexOf(b) : -1;
    if (indexA === -1 && indexB === -1) {
      const nameA = entries?.[a]?.name ?? a;
      const nameB = entries?.[b]?.name ?? b;
      return stringCompare(nameA, nameB);
    }
    if (indexA === -1) {
      return 1;
    }
    if (indexB === -1) {
      return -1;
    }
    return indexA - indexB;
  };
