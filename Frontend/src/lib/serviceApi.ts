import api from "./axios";
import { ServiceId } from "./serviceIds";

export type { ServiceId };

export interface ServiceRequest {
  serviceId: ServiceId;
  payload?: Record<string, any>;
  params?: Record<string, string>;
  query?: Record<string, any>;
}

/**
 * Call a centralized service endpoint via serviceId
 */
export async function callService<T = any>(request: ServiceRequest): Promise<T> {
  const { data } = await api.post<T>("/service", request);
  return data;
}
