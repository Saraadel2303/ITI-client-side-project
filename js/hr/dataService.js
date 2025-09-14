let cachedData = null;

export async function loadData() {
  if (cachedData) return cachedData;

  const res = await fetch("../../data/dataForTest.json");
  cachedData = await res.json();
  return cachedData;
}
