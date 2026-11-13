"use server";

import { store } from "@/lib/store";
import { assertAdmin } from "@/lib/auth";
import { CancellationRequestDTO } from "@/types";

/**
 * Customer submits a cancellation request for an eligible order
 */
export async function requestCancellationAction(
  orderId: string,
  reason: string,
  explanation?: string,
  profileId?: string
): Promise<{ success: boolean; cancellationRequest?: CancellationRequestDTO; error?: string }> {
  if (!orderId || !reason || !reason.trim()) {
    return { success: false, error: "Order ID and reason are required" };
  }

  return store.requestCancellation(orderId, reason, explanation, profileId);
}

/**
 * Admin: List all cancellation requests
 */
export async function listCancellationRequestsAction(
  adminSecretToken?: string
): Promise<{ success: boolean; requests: CancellationRequestDTO[]; error?: string }> {
  try {
    if (!adminSecretToken || adminSecretToken !== process.env.ADMIN_BOOTSTRAP_SECRET) {
      await assertAdmin();
    }

    const requests = await store.getCancellationRequests();
    return { success: true, requests };
  } catch (err: any) {
    return { success: false, requests: [], error: err.message || "Unauthorized" };
  }
}

/**
 * Admin: Approve or Reject a cancellation request.
 * CRITICAL INVARIANT: Restores stock exactly once (`isStockRestored = true`).
 */
export async function resolveCancellationAction(
  orderId: string,
  decision: "APPROVE" | "REJECT",
  responseNote?: string,
  adminSecretToken?: string
): Promise<{ success: boolean; message: string; isStockRestored: boolean; error?: string }> {
  try {
    if (!adminSecretToken || adminSecretToken !== process.env.ADMIN_BOOTSTRAP_SECRET) {
      await assertAdmin();
    }

    return store.resolveCancellation(orderId, decision, responseNote, "Admin");
  } catch (err: any) {
    return {
      success: false,
      message: "",
      isStockRestored: false,
      error: err.message || "Failed to resolve cancellation",
    };
  }
}
