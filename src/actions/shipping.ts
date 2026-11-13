"use server";

import { store } from "@/lib/store";
import { assertAdmin } from "@/lib/auth";
import { CreateShipmentInput, ShipmentDTO, OrderDTO } from "@/types";

/**
 * Admin: Create manual dispatch shipment for Bus Parcel or Railway Parcel.
 * Generates tracking ID format `ABT-TRK-XXXXXX` and marks order as SHIPPED.
 */
export async function createShipmentAction(
  input: CreateShipmentInput,
  adminSecretToken?: string
): Promise<{ success: boolean; shipment?: ShipmentDTO; error?: string }> {
  try {
    if (!adminSecretToken || adminSecretToken !== process.env.ADMIN_BOOTSTRAP_SECRET) {
      await assertAdmin();
    }

    if (!input.orderId) {
      return { success: false, error: "Order ID is required" };
    }

    if (!input.operatorName || !input.departureLocation || !input.destinationStation) {
      return {
        success: false,
        error: "Operator name, departure location, and destination station are required",
      };
    }

    return store.createShipment(input, "Admin");
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create shipment" };
  }
}

/**
 * Public customer tracking lookup
 * Returns shipment tracking details along with order preview
 */
export async function lookupTrackingAction(
  trackingNumber: string
): Promise<{
  success: boolean;
  shipment?: ShipmentDTO;
  order?: OrderDTO;
  error?: string;
}> {
  if (!trackingNumber || !trackingNumber.trim()) {
    return { success: false, error: "Please enter a valid tracking number" };
  }

  const result = await store.getShipmentByTrackingNumber(trackingNumber);
  if (!result) {
    return {
      success: false,
      error: `Tracking number "${trackingNumber}" was not found. Please double-check your receipt or SMS.`,
    };
  }

  return {
    success: true,
    shipment: result.shipment,
    order: result.order,
  };
}

/**
 * Lookup shipment for a specific order
 */
export async function getShipmentForOrderAction(
  orderId: string
): Promise<{ success: boolean; shipment?: ShipmentDTO | null }> {
  const shipment = await store.getShipmentByOrderId(orderId);
  return { success: true, shipment };
}
