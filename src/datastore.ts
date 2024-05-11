import type { Record, UserAmount } from "@/types";

const API = process.env.DATASTORE_API ?? "";
const TOKEN = process.env.DATASTORE_TOKEN ?? "";

export async function listUserAmount(): Promise<UserAmount[]> {
  const response = await fetch(`${API}?token=${TOKEN}&mode=listUserAmount`);
  const data: { data: UserAmount[] } = await response.json();

  return data.data;
}

export async function listRecords(count: number): Promise<Record[]> {
  const response = await fetch(
    `${API}?token=${TOKEN}&mode=listRecords&count=${count}`,
  );
  const data: { data: Record[] } = await response.json();

  return data.data;
}

export async function createRecord(params: Omit<Record, "id">): Promise<void> {
  const response = await fetch(API, {
    method: "POST",
    body: JSON.stringify({ token: TOKEN, mode: "createRecord", ...params }),
  });

  console.debug(response);
}

export async function deleteRecord(id: string): Promise<void> {
  const response = await fetch(API, {
    method: "POST",
    body: JSON.stringify({ token: TOKEN, mode: "deleteRecord", id }),
  });

  console.debug(response);
}
