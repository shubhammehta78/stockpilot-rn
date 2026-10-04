import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_PREFIX="stockpilot:";

export async function saveSnapshot(value:unknown,key="portfolio"){
  await AsyncStorage.setItem(KEY_PREFIX+key,JSON.stringify(value));
}

export async function loadSnapshot<T>(key="portfolio"):Promise<T|null>{
  const raw=await AsyncStorage.getItem(KEY_PREFIX+key);
  return raw?JSON.parse(raw) as T:null;
}
